using System.Security.Claims;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Services.Interfaces
{
    /// <summary>
    /// Contract for JWT access-token generation/validation and refresh-token creation.
    /// Lives in PharmaSphere.Services alongside its implementation (TokenService).
    /// </summary>
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
}
