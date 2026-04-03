using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Report
    {
        [Key] 
        public Guid ReportsID { get; set; }

        [Required]
        [MaxLength(100)] 
        public string Entity { get; set; } = null!;

        [Required]
        [MaxLength(2000)] 
        public string Reason { get; set; } = null!;

        [Required]
        [MaxLength(50)] 
        public string Status { get; set; } = null!;

        [Required]
        public DateTime Created_at { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)]
        public string Created_by { get; set; } = null!;

        [Required]
        public DateTime Updated_at { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)]
        public string Updated_by { get; set; } = null!;

        [Required]
        public Guid UserID { get; set; }

        [ForeignKey(nameof(UserID))]
        public User User { get; set; } = null!;

        // Polymorphic ID - 
        [Required]
        public Guid EntityID { get; set; }
    }
}
