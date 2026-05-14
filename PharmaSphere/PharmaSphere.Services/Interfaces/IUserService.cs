using PharmaSphere.Core.DTOs;

namespace PharmaSphere.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResultDto<UserListItemDto>> GetUsersAsync(UserListQueryDto query, CancellationToken ct = default);
        Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default);
        Task<UserByIdDto?> GetUserByIdAsync(int userId, CancellationToken ct = default);
        Task<UserListItemDto> CreateUserAsync(CreateUserRequestDto request, CancellationToken ct = default);
        Task<UserListItemDto> UpdateUserAsync(int userId, UpdateUserRequestDto request, CancellationToken ct = default);
        Task DeleteUserAsync(int userId, CancellationToken ct = default);
    }
}
