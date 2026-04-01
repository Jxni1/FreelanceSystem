using System;
namespace LabCourse2.Domain.Entities
{
    public class Favorite_Freelancer
    {
        public Guid Favorite_FreelancerID { get; set; }

    
        public Guid ClientID { get; set; }
        public ClientProfile Client { get; set; } = null!;

     
        public Guid FreelancerID { get; set; }
        public FreelancerProfile Freelancer { get; set; } = null!;
    }
}
