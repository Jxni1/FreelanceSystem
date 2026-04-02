using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Proposal
    { 
        public Guid ProposalId { get; set; }
         
        public decimal BidAmount { get; set; }

        public string Message { get; set; } = string.Empty;

        public int DeliveryDays { get; set; }

        public string Status { get; set; } = "Pending";  
         
        public Guid FreelancerId { get; set; }
        public virtual Freelancer Freelancer { get; set; } = null!;
         
        public Guid ProjectId { get; set; }
        public virtual Project Project { get; set; } = null!;
    }
}