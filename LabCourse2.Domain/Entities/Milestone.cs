using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Milestone
    {
        [Key] 
        public Guid MilestoneID { get; set; }

        [Required]
        [MaxLength(255)] 
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(2000)] 
        public string Description { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")] 
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be a positive number.")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string status { get; set; } = null!;

        [Required]
        public Guid ContractID { get; set; }

        [ForeignKey(nameof(ContractID))]
        public Contract Contract { get; set; } = null!;

        public ICollection<Deliverables> Deliverables { get; set; } = new List<Deliverables>();
    }
}
