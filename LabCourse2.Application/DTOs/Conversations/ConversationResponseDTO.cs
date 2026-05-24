namespace LabCourse2.Application.DTOs.Messages
{
    public class ConversationResponse
    {
        public Guid ConversationID { get; set; }
        public Guid? ContractID { get; set; }

        public Guid ClientID { get; set; }
        public Guid ClientUserID { get; set; }
        public string ClientUsername { get; set; } = string.Empty;

        public Guid FreelancerID { get; set; }
        public Guid FreelancerUserID { get; set; }
        public string FreelancerUsername { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public Guid RequestedByUserID { get; set; }
        public DateTime? RespondedAt { get; set; }

        public string? LastMessage { get; set; }
        public Guid? LastMessageSenderUserID { get; set; }
        public DateTime? LastMessageAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}