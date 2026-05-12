using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    /// <summary>
    /// Abstraction over user storage.
    /// Lives in PharmaSphere.Repositories alongside its implementation (UserRepository).
    /// </summary>
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
        Task<User?> GetByIdAsync(int userId, CancellationToken ct = default);
    }
}
