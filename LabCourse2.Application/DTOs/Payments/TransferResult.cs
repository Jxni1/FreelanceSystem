namespace LabCourse2.Application.DTOs.Payments
{
    public class TransferResult
    {
        public string TransferId { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string Currency { get; set; } = string.Empty;
    }
}
