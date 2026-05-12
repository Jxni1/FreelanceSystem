namespace LabCourse2.Application.DTOs.Notifications
{
    public class NotificationResponse
    {
        public Guid NotificationID { get; init; }
        public string Type { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string Message { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public bool IsRead { get; init; }
        public Guid UserID { get; init; }
    }
}