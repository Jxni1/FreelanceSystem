using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces.Payments;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Payments
{
    public class StripeWebhookService : IStripeWebhookService
    {
        private readonly IAppDbContext _context;

        public StripeWebhookService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task HandleAsync(StripeWebhookEvent webhookEvent, CancellationToken cancellationToken = default)
        {
            var alreadyProcessed = await _context.ProcessedStripeEvents
                .AnyAsync(e => e.EventId == webhookEvent.Id, cancellationToken);

            if (alreadyProcessed)
                return;

            switch (webhookEvent.Type)
            {
                case "checkout.session.completed":
                    await HandleCheckoutCompletedAsync(webhookEvent, cancellationToken);
                    break;
                case "checkout.session.expired":
                    await HandleCheckoutExpiredAsync(webhookEvent, cancellationToken);
                    break;
                case "account.updated":
                    await HandleAccountUpdatedAsync(webhookEvent, cancellationToken);
                    break;
            }

            _context.ProcessedStripeEvents.Add(new ProcessedStripeEvent
            {
                EventId = webhookEvent.Id,
                Type = webhookEvent.Type,
                ProcessedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync(cancellationToken);
        }

        private async Task HandleCheckoutCompletedAsync(StripeWebhookEvent e, CancellationToken ct)
        {
            if (!Guid.TryParse(e.PaymentId, out var paymentId))
                return;

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymentID == paymentId, ct);

            if (payment is null || payment.Status != PaymentStatus.RequiresPayment)
                return;

            payment.Status = PaymentStatus.Held;
            if (!string.IsNullOrEmpty(e.PaymentIntentId))
                payment.StripePaymentIntentId = e.PaymentIntentId;

            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.MilestoneID == payment.MilestoneID, ct);

            if (milestone is not null && milestone.status == MilestoneStatus.PendingPayment)
            {
                milestone.status = MilestoneStatus.Funded;
                milestone.Funded_at = DateTime.UtcNow;
            }

            if (payment.MilestoneID.HasValue)
            {
                var reference = e.PaymentIntentId ?? $"deposit-{payment.PaymentID:N}";
                var referenceExists = await _context.Transactions
                    .AnyAsync(t => t.Reference == reference, ct);

                if (!referenceExists)
                {
                    _context.Transactions.Add(new Transactions
                    {
                        TransactionsID = Guid.NewGuid(),
                        Type = TransactionType.Deposit,
                        Amount = payment.Amount,
                        Status = "completed",
                        Reference = reference,
                        PaymentID = payment.PaymentID,
                        MilestoneID = payment.MilestoneID.Value
                    });
                }
            }
        }

        private async Task HandleCheckoutExpiredAsync(StripeWebhookEvent e, CancellationToken ct)
        {
            if (!Guid.TryParse(e.PaymentId, out var paymentId))
                return;

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymentID == paymentId, ct);

            if (payment is null)
                return;

            if (payment.Status == PaymentStatus.RequiresPayment)
                payment.Status = PaymentStatus.Failed;

            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.MilestoneID == payment.MilestoneID, ct);

            if (milestone is not null && milestone.status == MilestoneStatus.PendingPayment)
                milestone.status = MilestoneStatus.Draft;
        }

        private async Task HandleAccountUpdatedAsync(StripeWebhookEvent e, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(e.ConnectedAccountId))
                return;

            var freelancer = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.StripeAccountId == e.ConnectedAccountId, ct);

            if (freelancer is null)
                return;

            if (e.PayoutsEnabled.HasValue)
                freelancer.StripePayoutsEnabled = e.PayoutsEnabled.Value;
        }
    }
}
