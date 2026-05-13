using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaSphere.Core.DTOs
{

    // ─── Requests ────────────────────────────────────────────────────────────────

    public sealed record LoginRequestDto(
        string Email,
        string Password,
        bool RememberMe = false);

    public sealed record RefreshTokenRequestDto(string RefreshToken);

    public sealed record LogoutRequestDto(string RefreshToken);

    public sealed record ForgotPasswordRequestDto(string Email);

    public sealed record TwoFactorSendRequestDto(string Email);

    public sealed record TwoFactorVerifyRequestDto(string Email, string Code);

    public sealed record ResetPasswordRequestDto(string Token, string NewPassword);

    // ─── Password-reset responses ────────────────────────────────────────────────

    /// <summary>Returned by GET /api/auth/validate-reset-token — confirms token is valid and returns the owner's email.</summary>
    public sealed record ValidateResetTokenResponseDto(string Email);

    // ─── Responses ───────────────────────────────────────────────────────────────

    /// <summary>Returned on successful login or token refresh.</summary>
    public sealed record AuthResponseDto(
        string AccessToken,
        string RefreshToken,
        int ExpiresIn);     // seconds

    /// <summary>Authenticated user's profile returned by GET /api/auth/me.</summary>
    public sealed record UserProfileDto(
        int UserId,
        string Email,
        string RoleName);
}
