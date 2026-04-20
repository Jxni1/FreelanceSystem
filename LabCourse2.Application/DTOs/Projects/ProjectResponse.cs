namespace LabCourse2.Application.DTOs.Projects
{
    public class ProjectResponse
    {
        public Guid ProjectID { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Budget { get; init; }
        public string Status { get; init; } = string.Empty;
        public string Visibility { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public Guid ClientID { get; init; }
        public Guid CategoryID { get; init; }
        public string CategoryName { get; init; } = string.Empty;
    }
}