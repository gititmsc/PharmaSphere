using PharmaSphere.Core.DTOs;

namespace PharmaSphere.Services.Interfaces
{
    /// <summary>
    /// Defines the authentication contract consumed by the API controllers.
    /// Lives in PharmaSphere.Services alongside its implementation (AuthService).
    /// </summary>
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
        Task LogoutAsync(string refreshToken, CancellationToken ct = default);
        Task ForgotPasswordAsync(string email, CancellationToken ct = default);
    }
}
