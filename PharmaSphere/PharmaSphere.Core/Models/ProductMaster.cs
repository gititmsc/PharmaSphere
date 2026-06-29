namespace PharmaSphere.Core.Models
{
    public sealed class ProductMaster
    {
        public int Id { get; set; }
        public string BrandName    { get; set; } = string.Empty;
        public string GenericName  { get; set; } = string.Empty;
        public string Vial         { get; set; } = string.Empty;
        public string SealColor    { get; set; } = string.Empty;
        public string WFI          { get; set; } = string.Empty;
        public string Label        { get; set; } = string.Empty;
        public string MonoBox      { get; set; } = string.Empty;
        public string MonthBox     { get; set; } = string.Empty;
        public string Tray         { get; set; } = string.Empty;
        public string Leaflet      { get; set; } = string.Empty;
        public string SyringeNeedle { get; set; } = string.Empty;
        public string Shrink       { get; set; } = string.Empty;
        public string Shipper      { get; set; } = string.Empty;
        public string Hologram     { get; set; } = string.Empty;
        public string? CreatedBy   { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy   { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted      { get; set; } = false;
    }
}
