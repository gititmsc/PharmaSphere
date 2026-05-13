using Microsoft.Extensions.DependencyInjection;
using PharmaSphere.Repositories.Auth;
using PharmaSphere.Repositories.Interfaces;



namespace PharmaSphere.Repositories
{
    public static class RepositoryServiceRegistration
    {
        public static IServiceCollection AddRepositories(
            this IServiceCollection services)
        {
            // Scoped lifetime — one instance per HTTP request, matches DbContext lifetime
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<ITwoFactorCodeRepository, TwoFactorCodeRepository>();

            return services;
        }
    }

}
