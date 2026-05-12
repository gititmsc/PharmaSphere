using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PharmaSphere.Core.Configuration;
using PharmaSphere.Core.Models;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Auth
{

    /// <summary>
    /// Generates signed JWT access tokens embedding UserId, EmailAddress and RoleName
    /// from the database, and produces cryptographically secure refresh tokens.
    /// </summary>
    public sealed class TokenService : ITokenService
    {
        private readonly JwtSettings _jwt;

        public TokenService(IOptions<JwtSettings> options)
        {
            _jwt = options.Value;
        }

        /// <inheritdoc />
        public string GenerateAccessToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Claims map directly to DB columns / navigation properties
            Claim[] claims =
            [
                new(JwtRegisteredClaimNames.Sub,   user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.EmailAddress),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier,     user.UserId.ToString()),
            new(ClaimTypes.Email,              user.EmailAddress),
            new(ClaimTypes.Role,               user.Role?.RoleName ?? string.Empty),
            new("roleId",                      user.RoleId.ToString()),
        ];

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwt.AccessTokenExpiryMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <inheritdoc />
        public string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes);
        }

        /// <inheritdoc />
        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var vp = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwt.Audience,
                ValidateLifetime = false,   // allow expired on purpose
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                                               Encoding.UTF8.GetBytes(_jwt.SecretKey)),
            };

            var principal = new JwtSecurityTokenHandler()
                .ValidateToken(token, vp, out var raw);

            if (raw is not JwtSecurityToken jwt ||
                !jwt.Header.Alg.Equals(
                    SecurityAlgorithms.HmacSha256,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token algorithm.");
            }

            return principal;
        }
    }

}
