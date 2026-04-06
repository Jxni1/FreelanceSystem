using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Contract
    {
        [Key] 
        public Guid ContractID { get; set; }

        [Required] 
        [MaxLength(2000)] 
        public string Description { get; set; } = null!;

        [Required]
        public DateTime Start_Date { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")] 
        [Range(0, double.MaxValue, ErrorMessage = "Price must be a positive number.")]
        public decimal Price { get; set; }

        [Required]
        public DateTime End_Date { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue, ErrorMessage = "Agreed Price must be a positive number.")]
        public decimal Agreed_Price { get; set; }

        [Required]
        [MaxLength(50)] 
        public string Status { get; set; } = null!;

        
        [Required]
        public Guid ClientID { get; set; }

        [ForeignKey(nameof(ClientID))]
        public ClientProfile Client { get; set; } = null!;

        [Required]
        public Guid FreelancerID { get; set; }

        [ForeignKey(nameof(FreelancerID))]
        public FreelancerProfile Freelancer { get; set; } = null!;

       
        [Required]
        public Guid ProjectID { get; set; }

        [ForeignKey(nameof(ProjectID))]
        public Project Project { get; set; } = null!;

        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<Payment> Payment { get; set; } = new List<Payment>();

    }
}
