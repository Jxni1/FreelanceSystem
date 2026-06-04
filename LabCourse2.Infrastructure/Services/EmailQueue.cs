using System.Threading.Channels;
using LabCourse2.Application.DTOs.Emails;
using LabCourse2.Application.Interfaces.Emails;

namespace LabCourse2.Infrastructure.Services
{
    public class EmailQueue : IEmailQueue
    {
        private readonly Channel<EmailMessage> _channel;

        public EmailQueue()
        {
            _channel = Channel.CreateUnbounded<EmailMessage>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
        }

        public void Enqueue(EmailMessage message)
        {
            _channel.Writer.TryWrite(message);
        }

        public IAsyncEnumerable<EmailMessage> DequeueAllAsync(CancellationToken cancellationToken)
        {
            return _channel.Reader.ReadAllAsync(cancellationToken);
        }
    }
}
