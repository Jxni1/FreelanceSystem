namespace LabCourse2.Domain.Entities
{
    public class Notifications
    {
        public Guid NotificationsID { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Created_at { get; set; } = DateTime.UtcNow;
        public bool Is_read { get; set; } = false;

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;
    }
}
