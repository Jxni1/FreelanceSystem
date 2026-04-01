using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Contract
    {
        public Guid ContractID { get; set; }
        public string Description { get; set; } = null!;
        public DateTime Start_Date { get; set; }
        public decimal Price { get; set; }
        public DateTime End_Date { get; set; }
        public decimal Agreed_Price { get; set; }
        public string Status { get; set; } = null!;

        // FK - Client
        public Guid ClientID { get; set; }
        public ClientProfile Client { get; set; } = null!;

        // FK - Freelancer
        public Guid FreelancerID { get; set; }
        public FreelancerProfile Freelancer { get; set; } = null!;

       
        // public Guid ProjectID { get; set; }
        // public Project Project { get; set; } = null!;
    }
}
