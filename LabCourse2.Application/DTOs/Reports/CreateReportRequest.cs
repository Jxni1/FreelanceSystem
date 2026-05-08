namespace LabCourse2.Application.DTOs.Reports
{
    public class CreateReportRequest
    {
        public string Entity { get; set; } = null!;
        public Guid EntityID { get; set; }
        public string Reason { get; set; } = null!;
    }
}