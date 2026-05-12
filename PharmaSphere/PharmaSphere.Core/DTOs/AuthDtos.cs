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
