using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    /// <summary>
    /// Abstraction over refresh-token storage.
    /// Lives in PharmaSphere.Repositories alongside its implementation (RefreshTokenRepository).
    /// </summary>
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
        Task AddAsync(RefreshToken token, CancellationToken ct = default);
        Task RevokeAllForUserAsync(int userId, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
