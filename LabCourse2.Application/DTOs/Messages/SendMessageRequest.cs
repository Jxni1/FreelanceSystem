namespace LabCourse2.Application.DTOs.Messages
{
    public class SendMessageRequest
    {
        public Guid ConversationID { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}