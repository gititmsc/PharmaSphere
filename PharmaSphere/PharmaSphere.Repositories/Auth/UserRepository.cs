using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Auth
{
    public sealed class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> HealthCheck()
        {
            return await _db.Users.FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        {
            return await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.EmailAddress == email, ct);
        }

        public async Task<User?> GetByIdAsync(int userId, CancellationToken ct = default)
        {
            return await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId, ct);
        }

        public async Task<PagedResultDto<UserListItemDto>> GetPagedAsync(
            UserListQueryDto query, CancellationToken ct = default)
        {
            var q = _db.Users.Include(u => u.Role).AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(u =>
                    u.EmailAddress.ToLower().Contains(s) ||
                    (u.FirstName != null && u.FirstName.ToLower().Contains(s)) ||
                    (u.LastName != null && u.LastName.ToLower().Contains(s)));
            }

            if (query.RoleId.HasValue)
                q = q.Where(u => u.RoleId == query.RoleId.Value);

            if (query.IsActive.HasValue)
                q = q.Where(u => u.IsActive == query.IsActive.Value);

            q = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
            {
                ("firstname", "desc") => q.OrderByDescending(u => u.FirstName),
                ("firstname", _)      => q.OrderBy(u => u.FirstName),
                ("lastname", "desc")  => q.OrderByDescending(u => u.LastName),
                ("lastname", _)       => q.OrderBy(u => u.LastName),
                ("email", "desc")     => q.OrderByDescending(u => u.EmailAddress),
                _                     => q.OrderBy(u => u.EmailAddress),
            };

            var totalCount = await q.CountAsync(ct);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => new UserListItemDto(
                    u.UserId,
                    u.EmailAddress,
                    u.FirstName,
                    u.LastName,
                    u.Role.RoleName,
                    u.RoleId,
                    u.IsActive))
                .ToListAsync(ct);

            return new PagedResultDto<UserListItemDto>(items, totalCount, query.Page, query.PageSize);
        }

        public async Task<IReadOnlyList<RoleDto>> GetAllRolesAsync(CancellationToken ct = default)
        {
            return await _db.Roles
                .OrderBy(r => r.RoleName)
                .Select(r => new RoleDto(r.RoleId, r.RoleName))
                .ToListAsync(ct);
        }

        public async Task AddAsync(User user, CancellationToken ct = default)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }

        public async Task<bool> EmailExistsAsync(
            string email, int? excludeUserId = null, CancellationToken ct = default)
        {
            var q = _db.Users.Where(u => u.EmailAddress == email);
            if (excludeUserId.HasValue)
                q = q.Where(u => u.UserId != excludeUserId.Value);
            return await q.AnyAsync(ct);
        }

        public async Task<bool> DeleteAsync(int userId, CancellationToken ct = default)
        {
            var user = await _db.Users.FindAsync([userId], ct);
            if (user is null) return false;
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
