using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task AddAsync(PasswordResetToken token, CancellationToken ct = default);
        Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken ct = default);
        Task InvalidateExistingAsync(int userId, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
