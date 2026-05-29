namespace LabCourse2.Application.DTOs.Payments
{
    public class FundMilestoneResponse
    {
        public Guid PaymentId { get; set; }

        public string CheckoutUrl { get; set; } = string.Empty;

        public string CheckoutSessionId { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}
