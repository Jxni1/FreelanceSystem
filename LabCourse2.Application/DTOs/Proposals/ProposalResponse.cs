namespace LabCourse2.Application.DTOs.Proposals
{
    public class ProposalResponse
    {
        public Guid ProposalId { get; init; }
        public string Message { get; init; } = string.Empty;
        public decimal BidAmount { get; init; }
        public int DeliveryDays { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime Created_at { get; init; }
        public Guid FreelancerId { get; init; }
        public string FreelancerName { get; init; } = string.Empty;
        public Guid ProjectId { get; init; }
        public string ProjectTitle { get; init; } = string.Empty;
    }
}
