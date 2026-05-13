namespace PharmaSphere.Services.Interfaces
{
    public interface IEmailService
    {
        /// <summary>Sends an HTML email to the given address.</summary>
        Task SendAsync(string toAddress, string subject, string htmlBody, CancellationToken ct = default);
    }
}
