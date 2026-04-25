namespace LabCourse2.Application.DTOs.Skills
{
    public class SkillQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
    }
}