using LabCourse2.Application.DTOs.Payments;

namespace LabCourse2.Application.Interfaces.Payments
{
    public interface IStripeWebhookService
    {
        Task HandleAsync(StripeWebhookEvent webhookEvent, CancellationToken cancellationToken = default);
    }
}
