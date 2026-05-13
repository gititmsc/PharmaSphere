using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PharmaSphere.Core.Configuration;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Email
{
    public sealed class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(
            IOptions<EmailSettings> options,
            ILogger<SmtpEmailService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendAsync(
            string toAddress,
            string subject,
            string htmlBody,
            CancellationToken ct = default)
        {
            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl,
                Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_settings.FromAddress, _settings.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            if(_settings.EnableTestMode)
            { 
                message.To.Add(_settings.TestToEmailAddress);
                 _logger.LogInformation("Test mode enabled: Email intended for {To} will be sent to {TestTo} instead.",
                    toAddress, _settings.TestToEmailAddress);
            }
            else
            {
                message.To.Add(toAddress);
            }
                

            await client.SendMailAsync(message, ct);

            _logger.LogInformation("Email sent to {To} — subject: {Subject}", toAddress, subject);
        }
    }
}
