namespace LabCourse2.Application.DTOs.Categories
{
    public class CategoryExportDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
       
    }
}