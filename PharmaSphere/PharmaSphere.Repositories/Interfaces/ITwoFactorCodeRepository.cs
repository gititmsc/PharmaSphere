using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface ITwoFactorCodeRepository
    {
        /// <summary>Persists a newly generated OTP code.</summary>
        Task AddAsync(TwoFactorCode code, CancellationToken ct = default);

        /// <summary>Returns the latest active (not used, not expired) code for a user.</summary>
        Task<TwoFactorCode?> GetLatestActiveAsync(int userId, CancellationToken ct = default);

        /// <summary>Marks all existing unused codes for a user as used (invalidates old codes on resend).</summary>
        Task InvalidateExistingAsync(int userId, CancellationToken ct = default);

        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
