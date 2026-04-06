using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Payment
    {
        public Guid PaymentID { get; set; }
        public string Payment_method { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime Payment_Date {  get; set; }

        public Guid ContractID { get; set; }

       public ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
    }
}
