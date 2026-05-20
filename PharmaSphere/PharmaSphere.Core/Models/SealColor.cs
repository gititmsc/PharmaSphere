namespace PharmaSphere.Core.Models
{
    public sealed class SealColor
    {
        public int SealColorId { get; set; }
        public string ColorName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
