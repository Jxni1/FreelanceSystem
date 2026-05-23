namespace LabCourse2.Application.DTOs.Reports
{
    public class ReportExportDto
    {
        public Guid ReportId { get; set; }
        public string Entity { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string? ReportedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}