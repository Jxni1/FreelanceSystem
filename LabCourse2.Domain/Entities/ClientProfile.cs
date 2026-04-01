using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class ClientProfile
    {
        public Guid ClientID { get; set; }
        public string Bio { get; set; } = null!;
        public string Industry { get; set; } = null!;
        public decimal Budget { get; set; }

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;

        
        public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    }
}
