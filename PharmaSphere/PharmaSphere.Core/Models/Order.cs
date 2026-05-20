namespace PharmaSphere.Core.Models
{
    public sealed class Order
    {
        public int OrderId { get; set; }

        // ── Admin Fields ──────────────────────────────────────────────────────────
        public string OrderNo { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string? BrandName { get; set; }
        public string? Composition { get; set; }
        public int? Qty { get; set; }
        public int? ShelfLifeMonths { get; set; }
        public decimal? MRP { get; set; }
        public string? Party { get; set; }
        public string? Make { get; set; }
        public string? AdminRemarks { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Amount { get; set; }
        public string? PaymentTerms { get; set; }
        public string? Vial { get; set; }
        public string? SealColour { get; set; }
        public string? WFI { get; set; }
        public string? Label { get; set; }
        public string? MonoBox { get; set; }
        public string? Tray { get; set; }
        public string? Leaflet { get; set; }
        public string? SyringeAndNeedle { get; set; }
        public string? Shrink { get; set; }
        public string? Shipper { get; set; }
        public DateTime? DeliverySchedule { get; set; }
        public string? OtherRemarks { get; set; }

        // ── QA Fields ─────────────────────────────────────────────────────────────
        public DateTime? PISApprovalDate { get; set; }
        public DateTime? SanoletPartyArtworkApprovalDate { get; set; }
        public string? QARemarks { get; set; }
        public DateTime? MonoBoxSupplyVendorApprovalDate { get; set; }
        public DateTime? LabelSupplyVendorApprovalDate { get; set; }
        public DateTime? InsertSupplyVendorApprovalDate { get; set; }
        public DateTime? TraySupplyVendorApprovalDate { get; set; }
        public DateTime? ShipperSupplyVendorApprovalDate { get; set; }

        // ── Production Fields ─────────────────────────────────────────────────────
        public string? ProductionMonoBox { get; set; }
        public string? ProductionLabel { get; set; }
        public string? ProductionInsert { get; set; }
        public string? ProductionTray { get; set; }
        public string? ProductionShipper { get; set; }
        public DateTime? FillingPlan { get; set; }
        public DateTime? PackingPlan { get; set; }
        public DateTime? Sterility14DaysDate { get; set; }
        public DateTime? DispatchDate { get; set; }

        // ── Status ────────────────────────────────────────────────────────────────
        public string CurrentStatus { get; set; } = OrderStatus.Created;

        // ── Audit ─────────────────────────────────────────────────────────────────
        public string? CreatedBy { get; set; }
        public int? CreatedByUserId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public int? UpdatedByUserId { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; } = true;

        // ── Navigation ────────────────────────────────────────────────────────────
        public User? CreatedByUser { get; set; }
        public User? UpdatedByUser { get; set; }
        public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
        public ICollection<OrderAuditLog> AuditLogs { get; set; } = new List<OrderAuditLog>();
    }

    public static class OrderStatus
    {
        public const string Created           = "Created";
        public const string ArtworkPending    = "Artwork Pending";
        public const string QAPending         = "QA Pending";
        public const string ProductionPending = "Production Pending";
        public const string Dispatched        = "Dispatched";
        public const string Cancelled         = "Cancelled";

        public static readonly IReadOnlyList<string> All = new[]
        {
            Created, ArtworkPending, QAPending, ProductionPending, Dispatched, Cancelled
        };

        public static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> AllowedTransitions =
            new Dictionary<string, IReadOnlyList<string>>
            {
                [Created]           = new[] { ArtworkPending, Cancelled },
                [ArtworkPending]    = new[] { QAPending, Cancelled },
                [QAPending]         = new[] { ProductionPending, Cancelled },
                [ProductionPending] = new[] { Dispatched, Cancelled },
                [Dispatched]        = Array.Empty<string>(),
                [Cancelled]         = Array.Empty<string>(),
            };
    }
}
