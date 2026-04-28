using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Application.DTOs.Categories
{
    public class UpdateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Photo { get; set; } = string.Empty;
    }
}
