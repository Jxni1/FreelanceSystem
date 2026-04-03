using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Review
    {
        [Key] 
        public Guid ReviewsID { get; set; }

        [Required]
        [MaxLength(2000)] 
        public string Comment { get; set; } = null!;

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")] 
        public int Rating { get; set; }

        [Required]
        public DateTime Created_at { get; set; } = DateTime.UtcNow;

      
        [Required]
        public Guid ContractID { get; set; }

        [ForeignKey(nameof(ContractID))]
        public Contract Contract { get; set; } = null!;

        
        [Required]
        public Guid FreelancerID { get; set; }

        [ForeignKey(nameof(FreelancerID))]
        public FreelancerProfile Freelancer { get; set; } = null!;

        
        [Required]
        public Guid ClientID { get; set; }

        [ForeignKey(nameof(ClientID))]
        public ClientProfile Client { get; set; } = null!;
    }
}
