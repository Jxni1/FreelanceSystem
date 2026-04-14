namespace LabCourse2.Application.DTOs.Projects
{
    public class UpdateProjectRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Budget { get; set; }
        public Guid? CategoryID { get; set; }
        public string? Visibility { get; set; }
        public string? Status { get; set; }
    }
}
