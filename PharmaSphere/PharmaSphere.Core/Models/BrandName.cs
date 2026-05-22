namespace PharmaSphere.Core.Models
{
    public sealed class BrandNameLookup
    {
        public int    BrandNameId { get; set; }
        public string BrandName   { get; set; } = string.Empty;
        public bool   IsActive    { get; set; } = true;
    }
}
