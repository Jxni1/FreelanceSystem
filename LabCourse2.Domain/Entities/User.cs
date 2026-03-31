using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabCourse2.Domain.Entities
{
    public class User
    {
        public Guid UserID { get; set; }
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password_Hash { get; set; } = null!;
        public bool Is_Active { get; set; } = true;
        public DateTime Created_At { get; set; } = DateTime.UtcNow;
        public DateTime Updated_At { get; set; } = DateTime.UtcNow;
        public string? Profile_Photo { get; set; }

        public FreelancerProfile? FreelancerProfile { get; set; }
        public ClientProfile? ClientProfile { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}