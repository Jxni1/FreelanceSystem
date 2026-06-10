namespace LabCourse2.Application.DTOs.Proposals
{
    public class ProposalExportDto
    {
        public Guid ProposalId { get; set; }
        public Guid ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public decimal BidAmount { get; set; }
        public int DeliveryDays { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}