namespace LabCourse2.Application.DTOs.Proposals
{
    public class CreateProposalRequest
    {
        public Guid ProjectId { get; init; }
        public string Message { get; init; } = string.Empty;
        public decimal BidAmount { get; init; }
        public int DeliveryDays { get; init; }
    }
}
