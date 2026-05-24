namespace LabCourse2.API.WebSockets
{
    public class WebSocketEventRequest
    {
        public string Type { get; set; } = string.Empty;
        public Guid? ConversationId { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid? ClientId { get; set; }
        public Guid? FreelancerId { get; set; }
        public Guid? ContractId { get; set; }
        public bool? Accept { get; set; }
    }
}