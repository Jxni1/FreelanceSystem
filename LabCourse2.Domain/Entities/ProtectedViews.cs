using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class Protected_Views
    {
        [Key] 
        public Guid Protected_ViewsID { get; set; }

        [Required]
        public DateTime Viewed_at { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)] 
        public string Created_by { get; set; } = null!;

        [Required]
        public DateTime Updated_at { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)]
        public string Updated_by { get; set; } = null!;

        [Required]
        public Guid ProjectID { get; set; }

        [ForeignKey(nameof(ProjectID))]
        public Project Project { get; set; } = null!;

        
        [Required]
        public Guid UserID { get; set; }

        [ForeignKey(nameof(UserID))]
        public User User { get; set; } = null!;
    }
}
