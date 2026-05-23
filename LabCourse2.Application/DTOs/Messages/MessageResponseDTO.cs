namespace LabCourse2.Application.DTOs.Messages
{
    public class MessageResponse
    {
        public Guid MessageID { get; set; }
        public Guid ConversationID { get; set; }
        public Guid SenderUserID { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }
}