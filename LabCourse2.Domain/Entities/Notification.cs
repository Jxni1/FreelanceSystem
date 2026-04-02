using System;

namespace LabCourse2.Domain.Entities
{
    public class Notification
    {
        public Guid NotificationID { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;

        
        public Guid UserID { get; set; }

        public virtual User User { get; set; } = null!;

    }
}