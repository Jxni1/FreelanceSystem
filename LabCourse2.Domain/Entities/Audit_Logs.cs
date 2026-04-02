using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Audit_Logs
    {
        public Guid Audit_LogsID { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public string old_values { get; set; } = string.Empty;

        public string new_values { get; set; } = string.Empty;

        public int IPaddress { get; set; }

        public DateTime Created_at { get; set; }

        public int EntityID { get; set; }

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;
    }
}
