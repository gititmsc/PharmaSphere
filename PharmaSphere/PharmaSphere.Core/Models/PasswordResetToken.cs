namespace PharmaSphere.Core.Models
{
    /// <summary>
    /// Stores a single-use GUID token for password reset.
    /// Maps to the [PasswordResetTokens] table.
    /// </summary>
    public sealed class PasswordResetToken
    {
        public int PasswordResetTokenId { get; set; }           // PK
        public int UserId { get; set; }                         // FK → Users.UserId
        public string Token { get; set; } = string.Empty;      // GUID string
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User User { get; set; } = default!;

        // Computed — not mapped
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsValid => !IsUsed && !IsExpired;
    }
}
