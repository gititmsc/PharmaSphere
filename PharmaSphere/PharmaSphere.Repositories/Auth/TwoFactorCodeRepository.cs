using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Auth
{
    public sealed class TwoFactorCodeRepository : ITwoFactorCodeRepository
    {
        private readonly AppDbContext _db;

        public TwoFactorCodeRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(TwoFactorCode code, CancellationToken ct = default)
        {
            await _db.TwoFactorCodes.AddAsync(code, ct);
        }

        public async Task<TwoFactorCode?> GetLatestActiveAsync(
            int userId, CancellationToken ct = default)
        {
            return await _db.TwoFactorCodes
                .Where(c => c.UserId == userId && !c.IsUsed && c.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<TwoFactorCode?> GetActiveByCodeAsync(
            int userId, string code, CancellationToken ct = default)
        {
            var trimmed = code.Trim();
            return await _db.TwoFactorCodes
                .Where(c => c.UserId == userId
                         && !c.IsUsed
                         && c.ExpiresAt > DateTime.UtcNow
                         && c.Code.Trim() == trimmed)
                .FirstOrDefaultAsync(ct);
        }

        public async Task InvalidateExistingAsync(int userId, CancellationToken ct = default)
        {
            var codes = await _db.TwoFactorCodes
                .Where(c => c.UserId == userId && !c.IsUsed)
                .ToListAsync(ct);

            foreach (var c in codes)
                c.IsUsed = true;
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
