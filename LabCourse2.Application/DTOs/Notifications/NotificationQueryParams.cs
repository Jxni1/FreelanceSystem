namespace LabCourse2.Application.DTOs.Notifications
{
    public class NotificationQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? Type { get; set; }
        public bool? IsRead { get; set; }
        public string? Search { get; set; }
    }
}