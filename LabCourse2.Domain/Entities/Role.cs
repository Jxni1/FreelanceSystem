using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Role
    {
        public Guid RoleID { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
