using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.Remoting.Channels;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Project
    {
        public Guid ProjectID { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Budget { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Visibility { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
         
        public Guid ClientID { get; set; }
        public virtual Client Client { get; set; } = null!;
         
        public Guid CategoryID { get; set; }
        public virtual Category Category { get; set; } = null!;

    }
}