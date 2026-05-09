namespace LabCourse2.Application.DTOs.Payments
{
    public class PaymentResponse
    {
        public Guid PaymentID { get; init; }
        public string PaymentMethod { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public DateTime PaymentDate { get; init; }
        public decimal Amount { get; init; }
        public Guid ContractID { get; init; }
        public Guid? MilestoneID { get; init; }
    }
}
