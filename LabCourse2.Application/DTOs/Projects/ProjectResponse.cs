namespace LabCourse2.Application.DTOs.Projects
{
    public class ProjectResponse
    {
        public Guid ProjectID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Visibility { get; set; } = string.Empty;
        public Guid ClientID { get; set; }
        public string? ClientName { get; set; }
        public Guid CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
