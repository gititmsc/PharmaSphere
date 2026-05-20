namespace PharmaSphere.Core.Models
{
    public sealed class OrderAuditLog
    {
        public int AuditLogId { get; set; }
        public int OrderId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? FieldName { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? ChangedBy { get; set; }
        public int? ChangedByUserId { get; set; }
        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;

        public Order Order { get; set; } = default!;
        public User? ChangedByUser { get; set; }
    }

    public static class AuditAction
    {
        public const string Created       = "Created";
        public const string Updated       = "Updated";
        public const string Deleted       = "Deleted";
        public const string Restored      = "Restored";
        public const string StatusChanged = "StatusChanged";
    }
}
