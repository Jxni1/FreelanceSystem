using LabCourse2.Application.Interfaces.Emails;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LabCourse2.Infrastructure.Services
{
    public class EmailBackgroundService : BackgroundService
    {
        private readonly IEmailQueue _queue;
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailBackgroundService> _logger;

        public EmailBackgroundService(IEmailQueue queue, IEmailService emailService, ILogger<EmailBackgroundService> logger)
        {
            _queue = queue;
            _emailService = emailService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await foreach (var message in _queue.DequeueAllAsync(stoppingToken))
                {
                    await _emailService.SendAsync(message.ToEmail, message.Subject, message.HtmlBody, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
            }
            catch (Exception ex)
            {
                _logger.LogError("[EMAIL] Background worker stopped unexpectedly | {Type}: {Message}", ex.GetType().Name, ex.Message);
            }
        }
    }
}
