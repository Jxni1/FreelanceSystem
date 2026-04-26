using System;

namespace LabCourse2.Domain.Entities
{
    public class Protected_Views
    {
        public Guid Protected_ViewsID { get; set; }

        public DateTime Viewed_at { get; set; }

        public string Created_by { get; set; } = null!;

        public DateTime Updated_at { get; set; }

        public string Updated_by { get; set; } = null!;

        public Guid ProjectID { get; set; }
        public Project Project { get; set; } = null!;

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;
    }
}
