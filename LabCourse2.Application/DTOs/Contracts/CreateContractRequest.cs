namespace LabCourse2.Application.DTOs.Contracts
{
    public class CreateContractRequest
    {
        public string Description { get; set; } = string.Empty;
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public decimal Agreed_Price { get; set; }
        public Guid? ProposalID { get; set; }
        public Guid FreelancerID { get; set; }
        public Guid ProjectID { get; set; }
    }
}
