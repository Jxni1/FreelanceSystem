using System;

namespace LabCourse2.Domain.Entities
{
    public class Message
    {
        public Guid MessageID { get; set; }

        public Guid ConversationID { get; set; }
        public Conversation Conversation { get; set; } = null!;

        public Guid SenderUserID { get; set; }
        public User SenderUser { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;

        public DateTime Sent_at { get; set; }

        public DateTime Created_at { get; set; }
        public string Created_by { get; set; } = string.Empty;

        public DateTime Updated_at { get; set; }
        public string Updated_by { get; set; } = string.Empty;
    }
}