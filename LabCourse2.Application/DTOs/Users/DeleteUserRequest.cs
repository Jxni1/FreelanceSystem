using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Application.DTOs.Users
{
    public class DeleteUserRequest
    {
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}