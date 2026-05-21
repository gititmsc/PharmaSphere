using PharmaSphere.Api.Extensions;
using PharmaSphere.Api.Middleware;
using PharmaSphere.Infrastructure.Extensions;   // AddInfrastructure (EF Core + SQL Server)
using PharmaSphere.Repositories;                 // AddRepositories
using PharmaSphere.Services;                     // AddApplicationServices


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── 1. JWT authentication (reads Jwt section from appsettings) ──────────────
builder.Services.AddJwtAuthentication(builder.Configuration);

// ── 2. Swagger with Bearer security definition ──────────────────────────────
builder.Services.AddSwaggerWithJwt();

// ── 3. EF Core DbContext + SQL Server (PharmaSphere.Infrastructure) ─────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── 4. Repository bindings (PharmaSphere.Repositories) ─────────────────────
builder.Services.AddRepositories();

// ── 5. AuthService, TokenService, PasswordHasher, EmailService (PharmaSphere.Services) ────
builder.Services.AddApplicationServices(builder.Configuration);

// CORS — allow the Vite dev server
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();

//Middleware pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.MapOpenApi();
//}
//if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PharmaSphere API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();   // must run before UseAuthorization so HttpContext.User is populated
app.UseAuthorization();
app.MapControllers();

app.Run();
