namespace PharmaSphere.Core.DTOs
{
    public sealed record ProductMasterListItemDto(
        int Id,
        string BrandName,
        string GenericName,
        string Vial,
        string SealColor,
        string MonoBox);

    public sealed record ProductMasterDetailDto(
        int Id,
        string BrandName,
        string GenericName,
        string Vial,
        string SealColor,
        string WFI,
        string Label,
        string MonoBox,
        string MonthBox,
        string Tray,
        string Leaflet,
        string SyringeNeedle,
        string Shrink,
        string Shipper,
        string Hologram,
        string? CreatedBy,
        string CreatedDate,
        string? UpdatedBy,
        string? UpdatedDate);

    public sealed record ProductMasterListQueryDto(
        string? Search    = null,
        string? BrandName = null,
        string? SortBy    = null,   // brandName|genericName|vial|sealColor|monoBox
        string? SortDir   = null,   // asc|desc
        int Page          = 1,
        int PageSize      = 10);

    public sealed record CreateProductMasterRequestDto(
        string BrandName,
        string GenericName,
        string Vial,
        string SealColor,
        string WFI,
        string Label,
        string MonoBox,
        string MonthBox,
        string Tray,
        string Leaflet,
        string SyringeNeedle,
        string Shrink,
        string Shipper,
        string Hologram);

    public sealed record UpdateProductMasterRequestDto(
        string BrandName,
        string GenericName,
        string Vial,
        string SealColor,
        string WFI,
        string Label,
        string MonoBox,
        string MonthBox,
        string Tray,
        string Leaflet,
        string SyringeNeedle,
        string Shrink,
        string Shipper,
        string Hologram);
}
