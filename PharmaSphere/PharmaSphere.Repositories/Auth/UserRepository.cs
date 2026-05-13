using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Auth
{

    /// <summary>
    /// EF Core implementation of IUserRepository.
    /// Queries the existing [Users] table (joined with [Role] for role name).
    /// </summary>
    public sealed class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Finds a user by EmailAddress (case-insensitive via SQL collation).
        /// Eagerly loads the Role navigation property so callers get RoleName.
        /// </summary>
        public async Task<User?> GetByEmailAsync(
            string email, CancellationToken ct = default)
        {
            return await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(
                    u => u.EmailAddress == email,
                    ct);
        }

        /// <summary>
        /// Finds a user by their integer primary key (UserId).
        /// Eagerly loads the Role navigation property.
        /// </summary>
        public async Task<User?> GetByIdAsync(
            int userId, CancellationToken ct = default)
        {
            return await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId, ct);
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _db.SaveChangesAsync(ct);
        }
    }

}
