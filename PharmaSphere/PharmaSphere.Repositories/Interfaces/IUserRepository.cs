using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
        Task<User?> GetByIdAsync(int userId, CancellationToken ct = default);
        Task<PagedResultDto<UserListItemDto>> GetPagedAsync(UserListQueryDto query, CancellationToken ct = default);
        Task<IReadOnlyList<RoleDto>> GetAllRolesAsync(CancellationToken ct = default);
        Task AddAsync(User user, CancellationToken ct = default);
        Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken ct = default);
        Task<bool> DeleteAsync(int userId, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
