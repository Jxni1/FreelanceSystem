using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Application.DTOs.Notifications
{
    public class UpdateNotificationRequest
    {
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public bool IsRead { get; set; }
    }
}