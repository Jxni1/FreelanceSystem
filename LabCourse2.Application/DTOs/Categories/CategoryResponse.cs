namespace LabCourse2.Application.DTOs.Categories
{
    public class CategoryResponse
    {
        public Guid CategoryID { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
    }
}