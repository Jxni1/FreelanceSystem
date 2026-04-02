using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class ProjectSkills
    { 
        public Guid ProjectSkillsID { get; set; }

        public Guid ProjectID { get; set; }
        public virtual Project Project { get; set; } = null!;

        public Guid SkillID { get; set; }
        public virtual Skills Skill { get; set; } = null!;
    }
}