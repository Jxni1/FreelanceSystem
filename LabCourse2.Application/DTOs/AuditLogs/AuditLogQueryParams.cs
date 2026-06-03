namespace LabCourse2.Application.DTOs.AuditLogs
{
    public class AuditLogQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? Action { get; set; }
        public string? Entity { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }
}