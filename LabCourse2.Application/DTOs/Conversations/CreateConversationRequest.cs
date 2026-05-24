namespace LabCourse2.Application.DTOs.Messages
{
    public class CreateConversationRequest
    {
        public Guid? ContractID { get; set; }
        public Guid? ClientID { get; set; }
        public Guid? FreelancerID { get; set; }
        public string? InitialMessage { get; set; }
    }
}