using System;

namespace LabCourse2.Domain.Entities
{
    public class Proposal
    {
        public Guid ProposalId { get; set; }

        public decimal BidAmount { get; set; }

        public string Message { get; set; } = string.Empty;

        public int DeliveryDays { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime Created_at { get; set; } = DateTime.UtcNow;

        public Guid FreelancerId { get; set; }
        public virtual FreelancerProfile Freelancer { get; set; } = null!;

        public Guid ProjectId { get; set; }
        public virtual Project Project { get; set; } = null!;
    }
}