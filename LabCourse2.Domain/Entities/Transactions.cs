using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Transactions
    {
        public Guid TransactionsID { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Reference { get; set; } = string.Empty;

        public Guid PaymentID { get; set; }

        public Guid MilestoneID { get; set; }

        public virtual Milestone Milestone { get; set; } = null!;
        public virtual Payment Payment { get; set; } = null!;
    }
}
