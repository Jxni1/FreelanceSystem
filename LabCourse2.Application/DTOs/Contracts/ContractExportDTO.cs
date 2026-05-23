namespace LabCourse2.Application.DTOs.Contracts
{
    public class ContractExportDto
    {
        public Guid ContractID { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid ClientID { get; set; }
        public string? ClientName { get; set; }
        public Guid FreelancerID { get; set; }
        public string? FreelancerName { get; set; }
        public Guid ProjectID { get; set; }
        public string? ProjectTitle { get; set; }
        public Guid? ProposalID { get; set; }
        public decimal AgreedPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}