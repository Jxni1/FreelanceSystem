using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class RolePermission
    {
        public Guid RolePermissionsID { get; set; }
        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public Guid RoleID { get; set; }
        public Role Role { get; set; } = null!;

        public Guid PermissionsID { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
