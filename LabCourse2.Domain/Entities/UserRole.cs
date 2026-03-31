using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class UserRole
    {
        public Guid UserRolesID { get; set; }
        public DateTime Assigned_At { get; set; } = DateTime.UtcNow;

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;

        public Guid RoleID { get; set; }
        public Role Role { get; set; } = null!;
    }
}
