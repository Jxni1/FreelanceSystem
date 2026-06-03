namespace LabCourse2.Application.DTOs.AuditLogs
{
    public class AuditLogResponse
    {
        public Guid AuditLogId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid UserId { get; set; }
        public string? Username { get; set; }
    }
}