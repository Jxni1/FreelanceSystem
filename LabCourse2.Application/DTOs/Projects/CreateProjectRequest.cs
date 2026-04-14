namespace LabCourse2.Application.DTOs.Projects
{
    public class CreateProjectRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public Guid ClientID { get; set; }
        public Guid CategoryID { get; set; }
        public string Visibility { get; set; } = "Public";
        public string Status { get; set; } = "Draft";
    }
}
