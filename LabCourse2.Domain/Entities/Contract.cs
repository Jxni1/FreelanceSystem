using System;
using System.Collections.Generic;

namespace LabCourse2.Domain.Entities
{
    public class Contract
    {
        public Guid ContractID { get; set; }

        public string Description { get; set; } = null!;

        public DateTime Start_Date { get; set; }

        public DateTime End_Date { get; set; }

        public decimal Agreed_Price { get; set; }

        public string Status { get; set; } = null!;

        public Guid? ProposalID { get; set; }
        public Proposal? Proposal { get; set; }

        public Guid ClientID { get; set; }
        public ClientProfile Client { get; set; } = null!;

        public Guid FreelancerID { get; set; }
        public FreelancerProfile Freelancer { get; set; } = null!;

        public Guid ProjectID { get; set; }
        public Project Project { get; set; } = null!;

        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Payment> Payment { get; set; } = new List<Payment>();
    }
}
