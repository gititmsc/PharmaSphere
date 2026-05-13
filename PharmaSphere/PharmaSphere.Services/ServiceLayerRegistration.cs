using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PharmaSphere.Core.Configuration;
using PharmaSphere.Services.Auth;
using PharmaSphere.Services.Email;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services
{

    public static class ServiceLayerRegistration
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<EmailSettings>(
                configuration.GetSection(EmailSettings.SectionName));

            services.AddSingleton<ITokenService, TokenService>();
            services.AddSingleton<IPasswordHasher, Sha256PasswordHasher>();
            services.AddScoped<IEmailService, SmtpEmailService>();
            services.AddScoped<IAuthService, AuthService>();

            return services;
        }
    }
}
