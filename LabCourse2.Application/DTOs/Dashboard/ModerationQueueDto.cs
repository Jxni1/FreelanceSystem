using System;

namespace LabCourse2.Application.DTOs.Dashboard
{
    public class ModerationQueueDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Item { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}