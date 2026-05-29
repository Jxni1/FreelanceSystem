namespace LabCourse2.Application.DTOs.Payments
{
    public class StripeWebhookEvent
    {
        public string Id { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string? PaymentId { get; set; }

        public string? MilestoneId { get; set; }

        public string? PaymentIntentId { get; set; }

        public string? CheckoutSessionId { get; set; }

        public string? PaymentStatus { get; set; }

        public string? ConnectedAccountId { get; set; }

        public bool? PayoutsEnabled { get; set; }

        public bool? TransfersEnabled { get; set; }
    }
}
