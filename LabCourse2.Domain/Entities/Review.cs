using System;

namespace LabCourse2.Domain.Entities
{
    public class Review
    {
        public Guid ReviewsID { get; set; }

        public string Comment { get; set; } = null!;

        public int Rating { get; set; }

        public DateTime Created_at { get; set; }

        public Guid ContractID { get; set; }
        public Contract Contract { get; set; } = null!;

        public Guid FreelancerID { get; set; }
        public FreelancerProfile Freelancer { get; set; } = null!;

        public Guid ClientID { get; set; }
        public ClientProfile Client { get; set; } = null!;
    }
}
