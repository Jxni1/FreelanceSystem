using System;

namespace LabCourse2.Domain.Entities
{
    public class Report
    {
        public Guid ReportsID { get; set; }

        public string Entity { get; set; } = null!;

        public string Reason { get; set; } = null!;

        public string Status { get; set; } = null!;

        public DateTime Created_at { get; set; }

        public string Created_by { get; set; } = null!;

        public DateTime Updated_at { get; set; }

        public string Updated_by { get; set; } = null!;

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;

        public Guid EntityID { get; set; }
    }
}
