namespace PharmaSphere.Core.Models
{
    public sealed class Party
    {
        public int    PartyId   { get; set; }
        public string PartyName { get; set; } = string.Empty;
        public bool   IsActive  { get; set; } = true;
    }
}
