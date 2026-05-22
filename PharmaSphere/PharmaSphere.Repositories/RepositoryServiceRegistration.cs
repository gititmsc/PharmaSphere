using Microsoft.Extensions.DependencyInjection;
using PharmaSphere.Repositories.Auth;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Repositories.Lookups;
using PharmaSphere.Repositories.Orders;



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
            services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<ILookupRepository, LookupRepository>();

            return services;
        }
    }

}
