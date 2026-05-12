using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PharmaSphere.Core.Configuration;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Auth
{

    /// <summary>
    /// Orchestrates login, token rotation, logout and password-reset flows.
    /// Depends on Services.Interfaces and Repositories.Interfaces — no EF or SQL here.
    /// </summary>
    public sealed class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly IRefreshTokenRepository _refreshTokens;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _hasher;
        private readonly JwtSettings _jwt;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository users,
            IRefreshTokenRepository refreshTokens,
            ITokenService tokenService,
            IPasswordHasher hasher,
            IOptions<JwtSettings> jwtOptions,
            ILogger<AuthService> logger)
        {
            _users = users;
            _refreshTokens = refreshTokens;
            _tokenService = tokenService;
            _hasher = hasher;
            _jwt = jwtOptions.Value;
            _logger = logger;
        }

        // ─── Login ────────────────────────────────────────────────────────────────

        public async Task<AuthResponseDto> LoginAsync(
            LoginRequestDto request, CancellationToken ct = default)
        {
            // 1. Look up user by EmailAddress (matches your DB column name)
            var user = await _users.GetByEmailAsync(request.Email, ct)
                ?? throw new UnauthorizedAccessException("Invalid email or password.");

            // 2. Check isActive bit
            if (!user.IsActive)
                throw new UnauthorizedAccessException("This account has been disabled.");

            // 3. Verify hashed password against stored Password column
            if (!_hasher.Verify(request.Password, user.Password))
                throw new UnauthorizedAccessException("Invalid email or password.");

            _logger.LogInformation(
                "User {UserId} ({Email}) authenticated successfully.",
                user.UserId, user.EmailAddress);

            return await IssueTokenPairAsync(user, ct);
        }

        // ─── Refresh ──────────────────────────────────────────────────────────────

        public async Task<AuthResponseDto> RefreshTokenAsync(
            string refreshToken, CancellationToken ct = default)
        {
            var stored = await _refreshTokens.GetByTokenAsync(refreshToken, ct)
                ?? throw new UnauthorizedAccessException("Refresh token not found.");

            if (!stored.IsActive)
                throw new UnauthorizedAccessException("Refresh token has expired or been revoked.");

            var user = await _users.GetByIdAsync(stored.UserId, ct)
                ?? throw new UnauthorizedAccessException("User not found.");

            // Revoke old token before issuing new pair (rotation)
            stored.IsRevoked = true;
            await _refreshTokens.SaveChangesAsync(ct);

            var response = await IssueTokenPairAsync(user, ct);
            stored.ReplacedByToken = response.RefreshToken;
            await _refreshTokens.SaveChangesAsync(ct);

            _logger.LogInformation("Token rotated for user {UserId}.", user.UserId);
            return response;
        }

        // ─── Logout ───────────────────────────────────────────────────────────────

        public async Task LogoutAsync(
            string refreshToken, CancellationToken ct = default)
        {
            var stored = await _refreshTokens.GetByTokenAsync(refreshToken, ct);
            if (stored is null) return;   // idempotent

            stored.IsRevoked = true;
            await _refreshTokens.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Refresh token revoked for user {UserId}.", stored.UserId);
        }

        // ─── Forgot Password ──────────────────────────────────────────────────────

        public Task ForgotPasswordAsync(
            string email, CancellationToken ct = default)
        {
            // TODO: generate reset token, persist, send via IEmailService
            _logger.LogInformation("Password reset requested for {Email}.", email);
            return Task.CompletedTask;
        }

        // ─── Private Helpers ──────────────────────────────────────────────────────

        private async Task<AuthResponseDto> IssueTokenPairAsync(
            User user, CancellationToken ct)
        {
            var accessToken = _tokenService.GenerateAccessToken(user);
            var rawRefresh = _tokenService.GenerateRefreshToken();

            var entity = new RefreshToken
            {
                Token = rawRefresh,
                UserId = user.UserId,           // int FK
                ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpiryDays),
            };

            await _refreshTokens.AddAsync(entity, ct);
            await _refreshTokens.SaveChangesAsync(ct);

            return new AuthResponseDto(
                AccessToken: accessToken,
                RefreshToken: rawRefresh,
                ExpiresIn: _jwt.AccessTokenExpiryMinutes * 60);
        }
    }

}
