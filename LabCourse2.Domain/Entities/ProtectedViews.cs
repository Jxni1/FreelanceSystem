using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Protected_Views
    {
        public Guid Protected_ViewsID { get; set; }
        public DateTime Viewed_at { get; set; } = DateTime.UtcNow;
        public string Created_by { get; set; } = null!;
        public DateTime Updated_at { get; set; } = DateTime.UtcNow;
        public string Updated_by { get; set; } = null!;

        // FK - Project (commented out until Project entity is created)
        // public Guid ProjectID { get; set; }
        // public Project Project { get; set; } = null!;

        
        public Guid UserID { get; set; }
        public User User { get; set; } = null!;
    }
}
