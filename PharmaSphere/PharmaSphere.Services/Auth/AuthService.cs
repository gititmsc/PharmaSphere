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
    /// Orchestrates login, token rotation, logout, 2FA and password-reset flows.
    /// Depends on Services.Interfaces and Repositories.Interfaces — no EF or SQL here.
    /// </summary>
    public sealed class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly IRefreshTokenRepository _refreshTokens;
        private readonly ITwoFactorCodeRepository _twoFactorCodes;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _hasher;
        private readonly IEmailService _email;
        private readonly JwtSettings _jwt;
        private readonly ILogger<AuthService> _logger;

        private const int OtpExpiryMinutes = 10;

        public AuthService(
            IUserRepository users,
            IRefreshTokenRepository refreshTokens,
            ITwoFactorCodeRepository twoFactorCodes,
            ITokenService tokenService,
            IPasswordHasher hasher,
            IEmailService email,
            IOptions<JwtSettings> jwtOptions,
            ILogger<AuthService> logger)
        {
            _users = users;
            _refreshTokens = refreshTokens;
            _twoFactorCodes = twoFactorCodes;
            _tokenService = tokenService;
            _hasher = hasher;
            _email = email;
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

        // ─── 2FA — Send ───────────────────────────────────────────────────────────

        public async Task SendTwoFactorCodeAsync(
            string email, CancellationToken ct = default)
        {
            // Use CancellationToken.None for every async call in this method.
            // The frontend fires send-2fa fire-and-forget, so the HTTP connection
            // can drop at any point — we must not let a cancelled request abort the
            // user lookup, DB writes, or email send mid-flight.
            var user = await _users.GetByEmailAsync(email, CancellationToken.None)
                ?? throw new UnauthorizedAccessException("User not found.");

            await _twoFactorCodes.InvalidateExistingAsync(user.UserId, CancellationToken.None);
            await _twoFactorCodes.SaveChangesAsync(CancellationToken.None);

            // Generate a cryptographically random 6-digit code
            var code = GenerateOtp();

            await _twoFactorCodes.AddAsync(new TwoFactorCode
            {
                UserId = user.UserId,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
            }, CancellationToken.None);
            await _twoFactorCodes.SaveChangesAsync(CancellationToken.None);

            var html = BuildOtpEmailHtml(code, OtpExpiryMinutes);
            await _email.SendAsync(user.EmailAddress, "Your PharmaSphere verification code", html, CancellationToken.None);

            _logger.LogInformation(
                "2FA code sent to user {UserId} ({Email}).", user.UserId, user.EmailAddress);
        }

        // ─── 2FA — Verify ─────────────────────────────────────────────────────────

        public async Task VerifyTwoFactorCodeAsync(
            string email, string code, CancellationToken ct = default)
        {
            var user = await _users.GetByEmailAsync(email, ct)
                ?? throw new UnauthorizedAccessException("Invalid verification attempt.");

            var stored = await _twoFactorCodes.GetLatestActiveAsync(user.UserId, ct)
                ?? throw new UnauthorizedAccessException("Verification code has expired or does not exist.");

            if (stored.Code != code)
                throw new UnauthorizedAccessException("Invalid verification code.");

            // Mark code consumed so it cannot be reused
            stored.IsUsed = true;
            await _twoFactorCodes.SaveChangesAsync(ct);

            _logger.LogInformation(
                "2FA verified for user {UserId} ({Email}).", user.UserId, user.EmailAddress);
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

        private static string GenerateOtp()
        {
            // Cryptographically random 6-digit code (000000–999999)
            var bytes = new byte[4];
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
            var value = (int)(BitConverter.ToUInt32(bytes, 0) % 1_000_000);
            return value.ToString("D6");
        }

        private static string BuildOtpEmailHtml(string code, int expiryMinutes) => $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;border-radius:8px;padding:32px;">
                <h2 style="color:#1976d2;margin-top:0;">PharmaSphere Verification</h2>
                <p>Use the code below to complete your sign-in. It expires in <strong>{expiryMinutes} minutes</strong>.</p>
                <div style="font-size:36px;font-weight:bold;letter-spacing:10px;text-align:center;
                            background:#f0f4ff;padding:20px;border-radius:6px;color:#1976d2;margin:24px 0;">
                  {code}
                </div>
                <p style="color:#666;font-size:13px;">If you did not attempt to sign in, please ignore this email.</p>
              </div>
            </body>
            </html>
            """;
    }

}
