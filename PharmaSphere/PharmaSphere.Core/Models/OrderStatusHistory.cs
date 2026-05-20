namespace PharmaSphere.Core.Models
{
    public sealed class OrderStatusHistory
    {
        public int HistoryId { get; set; }
        public int OrderId { get; set; }
        public string? FromStatus { get; set; }
        public string ToStatus { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public string? ChangedBy { get; set; }
        public int? ChangedByUserId { get; set; }
        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;

        public Order Order { get; set; } = default!;
        public User? ChangedByUser { get; set; }
    }
}
