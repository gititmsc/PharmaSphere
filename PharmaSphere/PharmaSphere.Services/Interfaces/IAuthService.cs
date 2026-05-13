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

        /// <summary>Validates a reset token and returns the owner's email address.</summary>
        Task<ValidateResetTokenResponseDto> ValidateResetTokenAsync(string token, CancellationToken ct = default);

        /// <summary>Sets a new password using a valid reset token.</summary>
        Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);

        /// <summary>Generates a 6-digit OTP, stores it, and emails it to the user.</summary>
        Task SendTwoFactorCodeAsync(string email, CancellationToken ct = default);

        /// <summary>Validates the OTP. Throws UnauthorizedAccessException if invalid/expired.</summary>
        Task VerifyTwoFactorCodeAsync(string email, string code, CancellationToken ct = default);
    }
}
