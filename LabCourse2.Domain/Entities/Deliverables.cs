using System;
namespace LabCourse2.Domain.Entities
{
    public class Deliverables
    {
        public Guid DeliverablesID { get; set; }
        public DateTime Submitted_at { get; set; } = DateTime.UtcNow;
        public DateTime? Approved_at { get; set; }

        public Guid MilestoneID { get; set; }
        public Milestone Milestone { get; set; } = null!;

        public Guid FileID { get; set; }
        public Files File { get; set; } = null!;

        // public Guid PaymentID { get; set; }
        // public Payment Payment { get; set; } = null!;
    }
}
