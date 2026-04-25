using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Application.DTOs.Skills
{
    public class CreateSkillRequest
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
    }
}