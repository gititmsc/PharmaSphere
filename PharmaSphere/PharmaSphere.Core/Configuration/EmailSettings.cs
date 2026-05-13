namespace PharmaSphere.Core.Configuration
{
    /// <summary>
    /// SMTP configuration bound from the "Email" section in appsettings.json.
    /// </summary>
    public sealed class EmailSettings
    {
        public const string SectionName = "Email";

        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpUsername { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public string FromName { get; set; } = "PharmaSphere";
        public bool EnableSsl { get; set; } = true;
    }
}
