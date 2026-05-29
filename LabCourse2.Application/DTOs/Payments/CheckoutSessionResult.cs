namespace LabCourse2.Application.DTOs.Payments
{
    public class CheckoutSessionResult
    {
        public string SessionId { get; set; } = string.Empty;

        public string Url { get; set; } = string.Empty;

        public string? PaymentIntentId { get; set; }

        public string Currency { get; set; } = string.Empty;
    }
}
