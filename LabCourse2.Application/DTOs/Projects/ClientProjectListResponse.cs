namespace LabCourse2.Application.DTOs.Projects
{
    public class ClientProjectListResponse
    {
        public Guid ProjectID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Budget { get; set; }
        public string? Status { get; set; }
        public string? Visibility { get; set; }
        public string? CategoryName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}