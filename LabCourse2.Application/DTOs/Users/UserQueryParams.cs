namespace LabCourse2.Application.DTOs.Users
{
    public class UserQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? Search { get; set; }       // name/username/email
        public bool? IsActive { get; set; }
        public string? Role { get; set; }         // "Admin", "Client", "Freelancer"
    }
}