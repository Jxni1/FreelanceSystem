namespace LabCourse2.Application.DTOs.Payments
{
    public class TransferRequest
    {
        public string DestinationAccountId { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public Guid PaymentId { get; set; }

        public Guid MilestoneId { get; set; }

        public string? PaymentIntentId { get; set; }
    }
}
