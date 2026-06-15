namespace PharmaSphere.Core.Models
{
    public sealed class OrderStatusConfig
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string Color { get; set; } = "default";
        public bool IsInitial { get; set; }
        public bool IsTerminal { get; set; }
        public bool ShowInFlow { get; set; } = true;
        public bool IsActive { get; set; } = true;
    }

    public sealed class OrderStatusTransition
    {
        public int TransitionId { get; set; }
        public string FromStatus { get; set; } = string.Empty;
        public string ToStatus { get; set; } = string.Empty;
    }
}
