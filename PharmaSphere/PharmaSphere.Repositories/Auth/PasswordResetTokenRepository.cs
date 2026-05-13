using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Auth
{
    public sealed class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly AppDbContext _db;

        public PasswordResetTokenRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(PasswordResetToken token, CancellationToken ct = default)
        {
            await _db.PasswordResetTokens.AddAsync(token, ct);
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(
            string token, CancellationToken ct = default)
        {
            return await _db.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token, ct);
        }

        public async Task InvalidateExistingAsync(int userId, CancellationToken ct = default)
        {
            var tokens = await _db.PasswordResetTokens
                .Where(t => t.UserId == userId && !t.IsUsed)
                .ToListAsync(ct);

            foreach (var t in tokens)
                t.IsUsed = true;
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
