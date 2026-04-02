using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class SavedProjects
    {
        public Guid SavedProjectID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? CreatedBy { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public string? UpdatedBy { get; set; }

        public Guid UserID { get; set; }
        public virtual User User { get; set; } = null!;

        public Guid ProjectID { get; set; }
        public virtual Project Project { get; set; } = null!;
    }
}