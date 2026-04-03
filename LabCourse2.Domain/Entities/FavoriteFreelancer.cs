using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Favorite_Freelancer
    {
        [Key] 
        public Guid Favorite_FreelancerID { get; set; }

        [Required]
        public Guid ClientID { get; set; }

        [ForeignKey(nameof(ClientID))]
        public ClientProfile Client { get; set; } = null!;

        
        [Required]
        public Guid FreelancerID { get; set; }

        [ForeignKey(nameof(FreelancerID))]
        public FreelancerProfile Freelancer { get; set; } = null!;
    }
}
