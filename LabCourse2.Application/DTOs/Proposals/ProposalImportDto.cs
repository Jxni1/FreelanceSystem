namespace LabCourse2.Application.DTOs.Proposals
{
    public class ProposalImportDto
    {
        public Guid ProjectId { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal BidAmount { get; set; }
        public int DeliveryDays { get; set; }
    }
}