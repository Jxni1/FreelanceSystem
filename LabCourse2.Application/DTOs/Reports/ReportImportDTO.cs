namespace LabCourse2.Application.DTOs.Reports
{
    public class ReportImportDto
    {
        public string Entity { get; set; } = string.Empty;
        public Guid EntityID { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public Guid UserID { get; set; }
    }
}