using LabCourse2.Application.DTOs.Emails;

namespace LabCourse2.Application.Interfaces.Emails
{
    public interface IEmailQueue
    {
        void Enqueue(EmailMessage message);
        IAsyncEnumerable<EmailMessage> DequeueAllAsync(CancellationToken cancellationToken);
    }
}
