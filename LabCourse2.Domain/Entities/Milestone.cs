using System;
using System.Collections.Generic;

namespace LabCourse2.Domain.Entities
{
    public class Milestone
    {
        public Guid MilestoneID { get; set; }

        public string Title { get; set; } = null!;

        public string Description { get; set; } = null!;

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public string status { get; set; } = null!;

        public int Order_Index { get; set; }

        public DateTime? Funded_at { get; set; }

        public DateTime? Submitted_at { get; set; }

        public DateTime? Approved_at { get; set; }

        public string? Submission_Note { get; set; }

        public string? Rejection_Note { get; set; }

        public Guid ContractID { get; set; }
        public Contract Contract { get; set; } = null!;

        public ICollection<Deliverables> Deliverables { get; set; } = new List<Deliverables>();
        public ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
    }
}
