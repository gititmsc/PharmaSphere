using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;

namespace PharmaSphere.Api.Middleware
{
    public sealed class ExceptionHandlingMiddleware
    {
        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next   = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext ctx)
        {
            try
            {
                await _next(ctx);
            }
            catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested)
            {
                _logger.LogInformation("{Method} {Path} — client disconnected.",
                    ctx.Request.Method, ctx.Request.Path);
                ctx.Response.StatusCode = 499;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Method} {Path} threw: {Msg}",
                    ctx.Request.Method, ctx.Request.Path, ex.Message);

                await PersistErrorAsync(ctx, ex);
                await WriteErrorAsync(ctx, ex);
            }
        }

        private async Task PersistErrorAsync(HttpContext ctx, Exception ex)
        {
            try
            {
                var db = ctx.RequestServices.GetService<AppDbContext>();
                if (db is null) return;

                var loginId = int.TryParse(
                    ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : (int?)null;

                var ip = ctx.Connection.RemoteIpAddress?.ToString()
                      ?? ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();

                // Truncate to column limit
                var browser = (ctx.Request.Headers["User-Agent"].ToString() ?? string.Empty);
                if (browser.Length > 50) browser = browser[..50];

                var ipTrunc = ip?.Length > 20 ? ip[..20] : ip;

                var entry = new ErrorLog
                {
                    ErrorDate        = DateTime.UtcNow,
                    LoginID          = loginId,
                    IPAddress        = ipTrunc,
                    ClientBrowser    = browser,
                    ErrorMessage     = ex.Message,
                    ErrorStackTrace  = ex.StackTrace,
                    URL              = $"{ctx.Request.Scheme}://{ctx.Request.Host}{ctx.Request.Path}",
                    URLReferrer      = ctx.Request.Headers["Referer"].FirstOrDefault(),
                    ErrorSource      = ex.Source,
                    ErrorTargetSite  = ex.TargetSite?.ToString(),
                    QueryString      = ctx.Request.QueryString.Value,
                };

                db.ErrorLogs.Add(entry);
                await db.SaveChangesAsync();
            }
            catch (Exception dbEx)
            {
                // Never let DB logging failure mask the original error
                _logger.LogWarning(dbEx, "Failed to persist error log to database.");
            }
        }

        private static Task WriteErrorAsync(HttpContext ctx, Exception ex)
        {
            var (code, msg) = ex switch
            {
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized,           ex.Message),
                ArgumentException           => (HttpStatusCode.BadRequest,             ex.Message),
                KeyNotFoundException        => (HttpStatusCode.NotFound,               ex.Message),
                InvalidOperationException   => (HttpStatusCode.Conflict,               ex.Message),
                _                           => (HttpStatusCode.InternalServerError, "An unexpected error occurred."),
            };

            ctx.Response.ContentType  = "application/json";
            ctx.Response.StatusCode   = (int)code;

            return ctx.Response.WriteAsync(
                JsonSerializer.Serialize(new { message = msg, statusCode = (int)code }, JsonOpts));
        }
    }
}
