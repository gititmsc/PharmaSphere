using System.Net;
using System.Text.Json;

namespace PharmaSphere.Api.Middleware
{
    /// <summary>
    /// Global exception → HTTP response mapper.
    /// Keeps every controller free of try/catch blocks.
    /// </summary>
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
            _next = next;
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
                // Client disconnected before the response was sent — not an error on our side.
                _logger.LogInformation("{Method} {Path} — client disconnected.",
                    ctx.Request.Method, ctx.Request.Path);
                ctx.Response.StatusCode = 499; // nginx convention: Client Closed Request
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Method} {Path} threw: {Msg}",
                    ctx.Request.Method, ctx.Request.Path, ex.Message);
                await WriteErrorAsync(ctx, ex);
            }
        }

        private static Task WriteErrorAsync(HttpContext ctx, Exception ex)
        {
            var (code, msg) = ex switch
            {
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
                InvalidOperationException => (HttpStatusCode.Conflict, ex.Message),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred."),
            };

            ctx.Response.ContentType = "application/json";
            ctx.Response.StatusCode = (int)code;

            return ctx.Response.WriteAsync(
                JsonSerializer.Serialize(new { message = msg, statusCode = (int)code }, JsonOpts));
        }
    }
}
