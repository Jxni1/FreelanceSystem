namespace LabCourse2.Application.DTOs.Contracts
{
    public class ContractImportDto
    {
        public string Description { get; set; } = string.Empty;
        public Guid ClientID { get; set; }
        public Guid FreelancerID { get; set; }
        public Guid ProjectID { get; set; }
        public Guid? ProposalID { get; set; }
        public decimal AgreedPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Pending";
    }
}