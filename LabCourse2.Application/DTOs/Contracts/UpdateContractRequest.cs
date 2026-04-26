namespace LabCourse2.Application.DTOs.Contracts
{
    public class UpdateContractRequest
    {
        public string Description { get; set; } = string.Empty;
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public decimal Price { get; set; }
        public decimal Agreed_Price { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
