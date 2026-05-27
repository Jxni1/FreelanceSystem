namespace LabCourse2.Application.DTOs.AI
{
    public class PositivePairExportRow
    {
        public Guid FreelancerId { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? ProposalId { get; set; }
        public Guid ContractId { get; set; }
        public decimal? BidAmount { get; set; }
        public int? DeliveryDays { get; set; }
        public string ProposalStatus { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string LabelSource { get; set; } = "contract";
        public int Label { get; set; } = 1;
    }
}