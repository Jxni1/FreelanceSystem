using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Application.DTOs.Projects
{
    public class CreateProjectRequest
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, double.MaxValue, ErrorMessage = "Budget must be greater than 0.")]
        public decimal Budget { get; set; }

        [Required]
        public string Visibility { get; set; } = string.Empty;

        [Required]
        public Guid CategoryID { get; set; }

        public List<Guid>? SkillIds { get; set; }
    }
}