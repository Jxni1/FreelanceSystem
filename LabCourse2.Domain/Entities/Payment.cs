using System;
using System.Collections.Generic;

namespace LabCourse2.Domain.Entities
{
    public class Payment
    {
        public Guid PaymentID { get; set; }

        public string Payment_method { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime Payment_Date { get; set; }

        public decimal Amount { get; set; }

        public Guid ContractID { get; set; }

        public Guid? MilestoneID { get; set; }
        public Milestone? Milestone { get; set; }

        public ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
    }
}
