using System;

namespace LabCourse2.Domain.Entities
{
    public class ProcessedStripeEvent
    {
        public string EventId { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public DateTime ProcessedAt { get; set; }
    }
}
