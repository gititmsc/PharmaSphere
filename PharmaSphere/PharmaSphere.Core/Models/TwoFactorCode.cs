namespace PharmaSphere.Core.Models
{
    /// <summary>
    /// Stores a 6-digit OTP code issued during the 2FA login step.
    /// Maps to the [TwoFactorCodes] table.
    /// </summary>
    public sealed class TwoFactorCode
    {
        public int TwoFactorCodeId { get; set; }            // PK
        public int UserId { get; set; }                     // FK → Users.UserId
        public string Code { get; set; } = string.Empty;   // 6-digit numeric string
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
