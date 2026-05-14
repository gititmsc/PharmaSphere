using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Users
{
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;

        public UserService(IUserRepository users, IPasswordHasher hasher)
        {
            _users = users;
            _hasher = hasher;
        }

        public Task<PagedResultDto<UserListItemDto>> GetUsersAsync(
            UserListQueryDto query, CancellationToken ct = default)
            => _users.GetPagedAsync(query, ct);

        public Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default)
            => _users.GetAllRolesAsync(ct);

        public async Task<UserByIdDto?> GetUserByIdAsync(int userId, CancellationToken ct = default)
        {
            var user = await _users.GetByIdAsync(userId, ct);
            if (user is null) return null;

            return new UserByIdDto(
                user.UserId,
                user.EmailAddress,
                user.FirstName,
                user.LastName,
                user.RoleId,
                user.IsActive);
        }

        public async Task<UserListItemDto> CreateUserAsync(
            CreateUserRequestDto request, CancellationToken ct = default)
        {
            if (await _users.EmailExistsAsync(request.Email, null, ct))
                throw new InvalidOperationException(
                    $"A user with email '{request.Email}' already exists.");

            var user = new User
            {
                EmailAddress = request.Email.Trim(),
                Password     = _hasher.Hash(request.Password),
                FirstName    = NullIfBlank(request.FirstName),
                LastName     = NullIfBlank(request.LastName),
                RoleId       = request.RoleId,
                IsActive     = request.IsActive,
            };

            await _users.AddAsync(user, ct);

            // Reload with Role navigation property populated
            var created = (await _users.GetByIdAsync(user.UserId, ct))!;
            return ToListItem(created);
        }

        public async Task<UserListItemDto> UpdateUserAsync(
            int userId, UpdateUserRequestDto request, CancellationToken ct = default)
        {
            var user = await _users.GetByIdAsync(userId, ct)
                ?? throw new KeyNotFoundException($"User {userId} not found.");

            // Check email uniqueness only when it actually changed
            if (!string.Equals(user.EmailAddress, request.Email.Trim(),
                    StringComparison.OrdinalIgnoreCase))
            {
                if (await _users.EmailExistsAsync(request.Email, userId, ct))
                    throw new InvalidOperationException(
                        $"A user with email '{request.Email}' already exists.");
            }

            user.EmailAddress = request.Email.Trim();
            user.FirstName    = NullIfBlank(request.FirstName);
            user.LastName     = NullIfBlank(request.LastName);
            user.RoleId       = request.RoleId;
            user.IsActive     = request.IsActive;

            if (!string.IsNullOrWhiteSpace(request.Password))
                user.Password = _hasher.Hash(request.Password);

            await _users.SaveChangesAsync(ct);
            return ToListItem(user);
        }

        public async Task DeleteUserAsync(int userId, CancellationToken ct = default)
        {
            var deleted = await _users.DeleteAsync(userId, ct);
            if (!deleted)
                throw new KeyNotFoundException($"User {userId} not found.");
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static string? NullIfBlank(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static UserListItemDto ToListItem(User u) =>
            new(u.UserId, u.EmailAddress, u.FirstName, u.LastName,
                u.Role?.RoleName ?? string.Empty, u.RoleId, u.IsActive);
    }
}
