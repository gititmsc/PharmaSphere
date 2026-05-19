using Microsoft.Extensions.Configuration;
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
        private readonly IPasswordResetTokenRepository _resetTokens;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _hasher;
        private readonly IEmailService _email;
        private readonly JwtSettings _jwt;
        private readonly string _frontendBaseUrl;
        private readonly ILogger<AuthService> _logger;

        private const int OtpExpiryMinutes = 10;
        private const int ResetTokenExpiryMinutes = 60;

        public AuthService(
            IUserRepository users,
            IRefreshTokenRepository refreshTokens,
            ITwoFactorCodeRepository twoFactorCodes,
            IPasswordResetTokenRepository resetTokens,
            ITokenService tokenService,
            IPasswordHasher hasher,
            IEmailService email,
            IOptions<JwtSettings> jwtOptions,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _users = users;
            _refreshTokens = refreshTokens;
            _twoFactorCodes = twoFactorCodes;
            _resetTokens = resetTokens;
            _tokenService = tokenService;
            _hasher = hasher;
            _email = email;
            _jwt = jwtOptions.Value;
            _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:3000";
            _logger = logger;
        }

        // ─── Login ────────────────────────────────────────────────────────────────

        public async Task<User?> HealthCheck()
        {
            return await _users.HealthCheck();
        }

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

        // ─── Forgot Password ─────────────────────────────────────────────────────

        public async Task ForgotPasswordAsync(
            string email, CancellationToken ct = default)
        {
            var user = await _users.GetByEmailAsync(email, ct);

            // Always return success to the caller — never reveal whether an email exists.
            if (user is null || !user.IsActive)
            {
                _logger.LogInformation("Password reset requested for unknown email {Email}.", email);
                return;
            }

            // Invalidate any pending tokens for this user before issuing a new one
            await _resetTokens.InvalidateExistingAsync(user.UserId, ct);
            await _resetTokens.SaveChangesAsync(ct);

            var rawToken = Guid.NewGuid().ToString();

            await _resetTokens.AddAsync(new PasswordResetToken
            {
                UserId    = user.UserId,
                Token     = rawToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(ResetTokenExpiryMinutes),
            }, ct);
            await _resetTokens.SaveChangesAsync(ct);

            var resetLink = $"{_frontendBaseUrl}/reset-password?token={rawToken}";
            var html = BuildResetEmailHtml(user.EmailAddress, resetLink, ResetTokenExpiryMinutes);

            await _email.SendAsync(
                user.EmailAddress,
                "Reset your PharmaSphere password",
                html,
                CancellationToken.None);

            _logger.LogInformation(
                "Password reset link sent to user {UserId} ({Email}).",
                user.UserId, user.EmailAddress);
        }

        // ─── Validate Reset Token ─────────────────────────────────────────────────

        public async Task<ValidateResetTokenResponseDto> ValidateResetTokenAsync(
            string token, CancellationToken ct = default)
        {
            var stored = await _resetTokens.GetByTokenAsync(token, ct);

            if (stored is null || !stored.IsValid)
                throw new UnauthorizedAccessException("This reset link is invalid or has expired.");

            return new ValidateResetTokenResponseDto(stored.User.EmailAddress);
        }

        // ─── Reset Password ───────────────────────────────────────────────────────

        public async Task ResetPasswordAsync(
            string token, string newPassword, CancellationToken ct = default)
        {
            var stored = await _resetTokens.GetByTokenAsync(token, ct);

            if (stored is null || !stored.IsValid)
                throw new UnauthorizedAccessException("This reset link is invalid or has expired.");

            var user = stored.User;
            user.Password = _hasher.Hash(newPassword);

            // Consume the token and persist everything atomically
            stored.IsUsed = true;
            await _users.SaveChangesAsync(ct);

            // Revoke all active sessions so re-login is required
            await _refreshTokens.RevokeAllForUserAsync(user.UserId, ct);
            await _refreshTokens.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Password reset completed for user {UserId} ({Email}).",
                user.UserId, user.EmailAddress);
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
            var user = await _users.GetByEmailAsync(email, CancellationToken.None)
                ?? throw new UnauthorizedAccessException("Invalid verification attempt.");

            // Search by code value directly: avoids CHAR(6) trailing-space padding issues
            // and handles the race-condition where send-2fa fires twice and the second call
            // invalidates the first code (the user still has the first code in their email).
            var stored = await _twoFactorCodes.GetActiveByCodeAsync(
                             user.UserId, code, CancellationToken.None)
                ?? throw new UnauthorizedAccessException("Invalid or expired verification code.");

            stored.IsUsed = true;
            await _twoFactorCodes.SaveChangesAsync(CancellationToken.None);

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

        private static string BuildResetEmailHtml(string email, string resetLink, int expiryMinutes) => $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;border-radius:8px;padding:32px;">
                <h2 style="color:#1976d2;margin-top:0;">Reset Your Password</h2>
                <p>Hi <strong>{email}</strong>,</p>
                <p>We received a request to reset your PharmaSphere password. Click the button below to choose a new password. This link expires in <strong>{expiryMinutes} minutes</strong>.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{resetLink}"
                     style="display:inline-block;background:#1976d2;color:#fff;text-decoration:none;
                            padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">
                    Reset Password
                  </a>
                </div>
                <p style="color:#666;font-size:13px;">
                  If the button doesn't work, copy and paste this link into your browser:<br/>
                  <a href="{resetLink}" style="color:#1976d2;word-break:break-all;">{resetLink}</a>
                </p>
                <p style="color:#666;font-size:13px;">If you did not request a password reset, please ignore this email.</p>
              </div>
            </body>
            </html>
            """;

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
