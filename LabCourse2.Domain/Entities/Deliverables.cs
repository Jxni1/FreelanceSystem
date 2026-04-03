using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Deliverables
    {
        [Key] 
        public Guid DeliverablesID { get; set; }

        [Required] 
        public DateTime Submitted_at { get; set; } = DateTime.UtcNow;

       
        public DateTime? Approved_at { get; set; }

       
        [Required]
        public Guid MilestoneID { get; set; }

        [ForeignKey(nameof(MilestoneID))]
        public Milestone Milestone { get; set; } = null!;

        
        [Required]
        public Guid FileID { get; set; }

        [ForeignKey(nameof(FileID))]
        public Files File { get; set; } = null!;

        // FK - Payment 
        //public Guid PaymentID { get; set; }
        //public Payment Payment { get; set; } = null!;
    }
}
