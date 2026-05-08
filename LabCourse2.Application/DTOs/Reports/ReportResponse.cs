namespace LabCourse2.Application.DTOs.Reports
{
    public class ReportResponse
    {
        public Guid ReportsID { get; set; }
        public string Entity { get; set; } = null!;
        public Guid EntityID { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime Created_at { get; set; }
        public string Created_by { get; set; } = null!;
        public DateTime Updated_at { get; set; }
        public string Updated_by { get; set; } = null!;
        public Guid UserID { get; set; }
    }
}