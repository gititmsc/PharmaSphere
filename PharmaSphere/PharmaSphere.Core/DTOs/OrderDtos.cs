namespace PharmaSphere.Core.DTOs
{
    // ── Query / Pagination ────────────────────────────────────────────────────────

    public sealed record OrderListQueryDto(
        string? Search      = null,
        string? Status      = null,
        string? DateFrom    = null,
        string? DateTo      = null,
        string? SortBy      = null,   // orderNo|orderDate|party|brandName|qty|status|createdDate|updatedDate
        string? SortDir     = null,   // asc|desc
        int Page            = 1,
        int PageSize        = 10);

    // ── List Item ─────────────────────────────────────────────────────────────────

    public sealed record OrderListItemDto(
        int OrderId,
        string OrderNo,
        string OrderDate,
        string? Party,
        string? BrandName,
        int? Qty,
        decimal? Amount,
        string CurrentStatus,
        string? CreatedBy,
        string CreatedDate,
        string? UpdatedDate,
        bool IsActive);

    // ── Detail ────────────────────────────────────────────────────────────────────

    public sealed record OrderDetailDto(
        int OrderId,
        // Admin
        string OrderNo,
        string OrderDate,
        string? Party,
        string? BrandName,
        string? Composition,
        int? Qty,
        string? ShelfLifeMonths,
        decimal? Amount,
        string? Make,
        string? AdminRemarks,
        string? Vial,
        string? SealColour,
        string? WFI,
        string? Label,
        string? MonoBox,
        string? Tray,
        string? Leaflet,
        string? SyringeAndNeedle,
        string? Shrink,
        string? Shipper,
        string? OtherRemarks,
        // QA
        string? PISApprovalDate,
        string? SanoletPartyArtworkApprovalDate,
        string? QARemarks,
        string? MonoBoxSupplyVendorApprovalDate,
        string? LabelSupplyVendorApprovalDate,
        string? InsertSupplyVendorApprovalDate,
        string? TraySupplyVendorApprovalDate,
        string? ShipperSupplyVendorApprovalDate,
        // Production
        string? ProductionMonoBox,
        string? ProductionLabel,
        string? ProductionInsert,
        string? ProductionTray,
        string? ProductionShipper,
        string? FillingPlan,
        string? PackingPlan,
        string? Sterility14DaysDate,
        string? DispatchDate,
        // Status & Audit
        string CurrentStatus,
        string? CreatedBy,
        string CreatedDate,
        string? UpdatedBy,
        string? UpdatedDate,
        bool IsActive,
        IReadOnlyList<OrderStatusHistoryDto> StatusHistory,
        IReadOnlyList<OrderAuditLogDto> AuditLogs);

    // ── Status History ────────────────────────────────────────────────────────────

    public sealed record OrderStatusHistoryDto(
        int HistoryId,
        string? FromStatus,
        string ToStatus,
        string? Remarks,
        string? ChangedBy,
        string ChangedDate);

    // ── Audit Log ─────────────────────────────────────────────────────────────────

    public sealed record OrderAuditLogDto(
        int AuditLogId,
        string Action,
        string? FieldName,
        string? OldValue,
        string? NewValue,
        string? ChangedBy,
        string ChangedDate);

    // ── Create / Update Requests ──────────────────────────────────────────────────

    public sealed record CreateOrderRequestDto(
        string OrderNo,
        string OrderDate,
        string? Party,
        string? BrandName,
        string? Composition,
        int? Qty,
        string? ShelfLifeMonths,
        decimal? Amount,
        string? Make,
        string? AdminRemarks,
        string? Vial,
        string? SealColour,
        string? WFI,
        string? Label,
        string? MonoBox,
        string? Tray,
        string? Leaflet,
        string? SyringeAndNeedle,
        string? Shrink,
        string? Shipper,
        string? OtherRemarks,
        string? PISApprovalDate,
        string? SanoletPartyArtworkApprovalDate,
        string? QARemarks,
        string? MonoBoxSupplyVendorApprovalDate,
        string? LabelSupplyVendorApprovalDate,
        string? InsertSupplyVendorApprovalDate,
        string? TraySupplyVendorApprovalDate,
        string? ShipperSupplyVendorApprovalDate,
        string? ProductionMonoBox,
        string? ProductionLabel,
        string? ProductionInsert,
        string? ProductionTray,
        string? ProductionShipper,
        string? FillingPlan,
        string? PackingPlan,
        string? Sterility14DaysDate,
        string? DispatchDate);

    public sealed record UpdateOrderRequestDto(
        string OrderNo,
        string OrderDate,
        string? Party,
        string? BrandName,
        string? Composition,
        int? Qty,
        string? ShelfLifeMonths,
        decimal? Amount,
        string? Make,
        string? AdminRemarks,
        string? Vial,
        string? SealColour,
        string? WFI,
        string? Label,
        string? MonoBox,
        string? Tray,
        string? Leaflet,
        string? SyringeAndNeedle,
        string? Shrink,
        string? Shipper,
        string? OtherRemarks,
        string? PISApprovalDate,
        string? SanoletPartyArtworkApprovalDate,
        string? QARemarks,
        string? MonoBoxSupplyVendorApprovalDate,
        string? LabelSupplyVendorApprovalDate,
        string? InsertSupplyVendorApprovalDate,
        string? TraySupplyVendorApprovalDate,
        string? ShipperSupplyVendorApprovalDate,
        string? ProductionMonoBox,
        string? ProductionLabel,
        string? ProductionInsert,
        string? ProductionTray,
        string? ProductionShipper,
        string? FillingPlan,
        string? PackingPlan,
        string? Sterility14DaysDate,
        string? DispatchDate);

    public sealed record ChangeStatusRequestDto(
        string NewStatus,
        string? Remarks = null);

}
