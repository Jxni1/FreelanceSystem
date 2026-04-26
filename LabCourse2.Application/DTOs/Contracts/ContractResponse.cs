namespace LabCourse2.Application.DTOs.Contracts
{
    public class ContractResponse
    {
        public Guid ContractID { get; init; }
        public string Description { get; init; } = string.Empty;
        public DateTime Start_Date { get; init; }
        public DateTime End_Date { get; init; }
        public decimal Price { get; init; }
        public decimal Agreed_Price { get; init; }
        public string Status { get; init; } = string.Empty;

        public Guid ClientID { get; init; }
        public string ClientName { get; init; } = string.Empty;

        public Guid FreelancerID { get; init; }
        public string FreelancerName { get; init; } = string.Empty;

        public Guid ProjectID { get; init; }
        public string ProjectTitle { get; init; } = string.Empty;
    }
}
