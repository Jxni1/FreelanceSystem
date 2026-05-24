using System;
using System.Collections.Generic;

namespace LabCourse2.Domain.Entities
{
    public class Conversation
    {
        public Guid ConversationID { get; set; }

        public Guid? ContractID { get; set; }
        public Contract? Contract { get; set; }

        public Guid ClientID { get; set; }
        public ClientProfile Client { get; set; } = null!;

        public Guid FreelancerID { get; set; }
        public FreelancerProfile Freelancer { get; set; } = null!;

        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        public Guid RequestedByUserID { get; set; }
        public DateTime? RespondedAt { get; set; }

        public DateTime Created_at { get; set; }
        public string Created_by { get; set; } = string.Empty;

        public DateTime Updated_at { get; set; }
        public string Updated_by { get; set; } = string.Empty;

        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}