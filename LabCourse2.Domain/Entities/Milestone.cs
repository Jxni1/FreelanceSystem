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

        public Guid ContractID { get; set; }
        public Contract Contract { get; set; } = null!;

        public ICollection<Deliverables> Deliverables { get; set; } = new List<Deliverables>();
        public ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
    }
}
