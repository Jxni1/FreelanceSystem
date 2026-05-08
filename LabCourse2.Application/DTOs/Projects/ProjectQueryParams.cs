namespace LabCourse2.Application.DTOs.Projects
{
    public class ProjectQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? Search { get; set; }
        public Guid? CategoryID { get; set; }
        public string? Status { get; set; }
        public string? Visibility { get; set; }
        public string? Skill { get; set; }
    }
}