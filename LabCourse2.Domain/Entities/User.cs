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

        public ICollection<Protected_Views> ProtectedViews { get; set; } = new List<Protected_Views>();

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public ICollection<Report> Reports { get; set; } = new List<Report>();

        public ICollection<Audit_Logs> AuditLogs { get; set; } = new List<Audit_Logs>();

    }
}