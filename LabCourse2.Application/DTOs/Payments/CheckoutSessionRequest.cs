namespace LabCourse2.Application.DTOs.Payments
{
    public class CheckoutSessionRequest
    {
        public Guid PaymentId { get; set; }

        public Guid MilestoneId { get; set; }

        public decimal Amount { get; set; }

        public string ProductName { get; set; } = string.Empty;
    }
}
