using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class Settings
    {
        public Guid SettingsID { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public DateTime Created_at { get; set; } = DateTime.UtcNow;

        public DateTime? Updated_at { get; set; }

        public string Created_by { get; set; } = string.Empty;

        public string? Updated_by { get; set; }
    }
}
