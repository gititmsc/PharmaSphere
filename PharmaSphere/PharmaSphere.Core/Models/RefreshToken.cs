using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaSphere.Core.Models
{

    /// <summary>
    /// Stores active refresh tokens server-side for revocation support.
    /// Maps to the [RefreshTokens] table (created via EF migration).
    /// </summary>
    public sealed class RefreshToken
    {
        public int RefreshTokenId { get; set; }         // PK
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ReplacedByToken { get; set; }

        // FK → Users.UserId
        public int UserId { get; set; }
        public User User { get; set; } = default!;

        // Computed — not mapped to DB columns
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsActive => !IsRevoked && !IsExpired;
    }

}
