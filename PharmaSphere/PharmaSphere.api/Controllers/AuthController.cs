using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{

    /// <summary>
    /// Authentication endpoints — thin controller, all logic in IAuthService.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    [Produces("application/json")]
    public sealed class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _users;

        public AuthController(IAuthService authService, IUserRepository users)
        {
            _authService = authService;
            _users = users;
        }

        // POST /api/auth/login
        /// <summary>Authenticate with EmailAddress and Password; returns JWT token pair.</summary>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequestDto request, CancellationToken ct)
        {
            var result = await _authService.LoginAsync(request, ct);
            return Ok(result);
        }

        // POST /api/auth/refresh
        /// <summary>Rotate the JWT pair using a valid refresh token.</summary>
        [HttpPost("refresh")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh(
            [FromBody] RefreshTokenRequestDto request, CancellationToken ct)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken, ct);
            return Ok(result);
        }

        // POST /api/auth/logout
        /// <summary>Revoke a refresh token (server-side logout).</summary>
        [HttpPost("logout")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Logout(
            [FromBody] LogoutRequestDto request, CancellationToken ct)
        {
            await _authService.LogoutAsync(request.RefreshToken, ct);
            return NoContent();
        }

        // GET /api/auth/me
        /// <summary>Returns the authenticated user's profile (UserId, Email, RoleName).</summary>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Me(CancellationToken ct)
        {
            // UserId is an int in the DB — stored in the "sub" JWT claim
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue(JwtClaims.Sub);

            if (!int.TryParse(sub, out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            var user = await _users.GetByIdAsync(userId, ct);
            if (user is null) return Unauthorized(new { message = "User not found." });

            return Ok(new UserProfileDto(
                user.UserId,
                user.EmailAddress,
                user.Role?.RoleName ?? string.Empty));
        }

        // POST /api/auth/forgot-password
        /// <summary>Initiates the forgot-password flow (sends a reset email).</summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> ForgotPassword(
            [FromBody] ForgotPasswordRequestDto request, CancellationToken ct)
        {
            await _authService.ForgotPasswordAsync(request.Email, ct);
            return NoContent();
        }

        // POST /api/auth/send-2fa
        /// <summary>Generates a 6-digit OTP and emails it to the user after a successful password login.</summary>
        [HttpPost("send-2fa")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> SendTwoFactor(
            [FromBody] TwoFactorSendRequestDto request, CancellationToken ct)
        {
            await _authService.SendTwoFactorCodeAsync(request.Email, ct);
            return NoContent();
        }

        // POST /api/auth/verify-2fa
        /// <summary>Validates the 6-digit OTP entered by the user.</summary>
        [HttpPost("verify-2fa")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> VerifyTwoFactor(
            [FromBody] TwoFactorVerifyRequestDto request, CancellationToken ct)
        {
            await _authService.VerifyTwoFactorCodeAsync(request.Email, request.Code, ct);
            return NoContent();
        }

        // ─── Private helpers ──────────────────────────────────────────────────────
        private static class JwtClaims
        {
            public const string Sub = "sub";
        }
    }

}
