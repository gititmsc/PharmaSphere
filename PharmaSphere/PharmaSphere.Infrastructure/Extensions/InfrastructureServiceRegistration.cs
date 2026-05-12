using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PharmaSphere.Infrastructure.Persistence;

namespace PharmaSphere.Infrastructure.Extensions
{

    /// <summary>
    /// Registers the EF Core DbContext with the SQL Server provider.
    /// Called from Program.cs via builder.Services.AddInfrastructure(configuration).
    /// </summary>
    public static class InfrastructureServiceRegistration
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("PharmaSphereDb")
                ?? throw new InvalidOperationException(
                    "Connection string 'PharmaSphereDb' is not configured in appsettings.json.");

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    connectionString,
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorNumbersToAdd: null);
                        sqlOptions.CommandTimeout(30);
                    }));

            return services;
        }
    }

}
