using Microsoft.Extensions.DependencyInjection;
using PharmaSphere.Services.Auth;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services
{

    public static class ServiceLayerRegistration
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {
            services.AddSingleton<ITokenService, TokenService>();
            services.AddSingleton<IPasswordHasher, Sha256PasswordHasher>();
            services.AddScoped<IAuthService, AuthService>();

            return services;
        }
    }
}
