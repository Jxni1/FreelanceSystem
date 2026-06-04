using LabCourse2.Application.Interfaces.Emails;
using LabCourse2.Infrastructure.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace LabCourse2.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(toEmail))
            {
                _logger.LogWarning("[EMAIL] Skipped send to '{To}' - host or recipient not configured.", toEmail);
                return;
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;
                message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

                using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(_settings.TimeoutSeconds));
                using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

                using var client = new SmtpClient();

                var socketOptions = _settings.UseStartTls
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.Auto;

                await client.ConnectAsync(_settings.Host, _settings.Port, socketOptions, linkedCts.Token);

                if (!string.IsNullOrWhiteSpace(_settings.Username))
                    await client.AuthenticateAsync(_settings.Username, _settings.Password, linkedCts.Token);

                await client.SendAsync(message, linkedCts.Token);
                await client.DisconnectAsync(true, linkedCts.Token);

                _logger.LogInformation("[EMAIL] Sent to '{To}' | Subject: {Subject}", toEmail, subject);
            }
            catch (OperationCanceledException)
            {
                _logger.LogError("[EMAIL] TIMEOUT sending to '{To}' after {Seconds}s.", toEmail, _settings.TimeoutSeconds);
            }
            catch (Exception ex)
            {
                _logger.LogError("[EMAIL] ERROR sending to '{To}' | {Type}: {Message}", toEmail, ex.GetType().Name, ex.Message);
            }
        }
    }
}
