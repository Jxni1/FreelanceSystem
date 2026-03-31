using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class FreelancerProfile
    {
        public Guid FreelancerID { get; set; }
        public string Experience_Level { get; set; } = null!;
        public decimal Hourly_Rate { get; set; }

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;
    }
}
