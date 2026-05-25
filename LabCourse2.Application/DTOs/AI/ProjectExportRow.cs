namespace LabCourse2.Application.DTOs.AI
{
    public class ProjectExportRow
    {
        public Guid ProjectId { get; set; }
        public Guid ClientId { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Visibility { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string SkillsText { get; set; } = string.Empty;
        public string ProjectText { get; set; } = string.Empty;
    }
}