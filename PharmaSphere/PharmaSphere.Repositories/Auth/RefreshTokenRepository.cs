using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Auth
{

    /// <summary>
    /// EF Core implementation of IRefreshTokenRepository.
    /// Manages rows in the [RefreshTokens] table.
    /// </summary>
    public sealed class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _db;

        public RefreshTokenRepository(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>Looks up an active refresh token by its raw token string.</summary>
        public async Task<RefreshToken?> GetByTokenAsync(
            string token, CancellationToken ct = default)
        {
            return await _db.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token, ct);
        }

        /// <summary>Persists a newly issued refresh token.</summary>
        public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
        {
            await _db.RefreshTokens.AddAsync(token, ct);
        }

        /// <summary>Revokes all active refresh tokens for a given user (force-logout).</summary>
        public async Task RevokeAllForUserAsync(
            int userId, CancellationToken ct = default)
        {
            var tokens = await _db.RefreshTokens
                .Where(t => t.UserId == userId && !t.IsRevoked)
                .ToListAsync(ct);

            foreach (var t in tokens)
                t.IsRevoked = true;
        }

        /// <inheritdoc />
        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _db.SaveChangesAsync(ct);
        }
    }

}
