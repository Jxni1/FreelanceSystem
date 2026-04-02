using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class FreelancerSkills
    { 
        public Guid FreelancerSkillsID { get; set;}

        public string Level { get; set;} = string.Empty;

        public Guid FreelancerID { get; set; }
        public virtual FreelancerProfile Freelancer { get; set; } = null!;

        public Guid SkillID { get; set; }
        public virtual Skills Skill { get; set; } = null!;

    }
}