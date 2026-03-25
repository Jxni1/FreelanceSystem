using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Entities
{
    public class User
    {
        [Key] 
        public int UserID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Surname { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password_hash { get; set; } = string.Empty;

        public bool Is_active { get; set; } = true;

        public DateTime Created_at { get; set; } = DateTime.UtcNow;

        public DateTime? Updated_at { get; set; }

        public string? Profile_photo { get; set; }
    }
}