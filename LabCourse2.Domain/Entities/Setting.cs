using System;

namespace LabCourse2.Domain.Entities
{
    public class Setting
    {
        public Guid SettingID { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}