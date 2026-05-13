using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface ITwoFactorCodeRepository
    {
        /// <summary>Persists a newly generated OTP code.</summary>
        Task AddAsync(TwoFactorCode code, CancellationToken ct = default);

        /// <summary>Returns the latest active (not used, not expired) code for a user.</summary>
        Task<TwoFactorCode?> GetLatestActiveAsync(int userId, CancellationToken ct = default);

        /// <summary>
        /// Returns an active code that matches the given value, or null.
        /// Trims CHAR padding server-side so the comparison is always exact.
        /// </summary>
        Task<TwoFactorCode?> GetActiveByCodeAsync(int userId, string code, CancellationToken ct = default);

        /// <summary>Marks all existing unused codes for a user as used (invalidates old codes on resend).</summary>
        Task InvalidateExistingAsync(int userId, CancellationToken ct = default);

        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
