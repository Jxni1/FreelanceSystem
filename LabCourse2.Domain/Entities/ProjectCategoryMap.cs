using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class ProjectCategoryMap
    {
        public Guid ProjectCategoryMapID { get; set; }

        public Guid CategoryID { get; set; }
        public virtual Category Category { get; set; } = null!;

        public Guid ProjectID { get; set; }
        public virtual Project Project { get; set; } = null!;
    }
}