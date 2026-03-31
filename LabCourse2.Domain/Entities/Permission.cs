using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Permission
    {
        public Guid PermissionsID { get; set; }
        public string Name { get; set; } = null!;       
        public string Description { get; set; } = null!;

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
