namespace LabCourse2.Application.DTOs.Reviews
{
    public class ReviewQueryParams
    {
        private const int MaxPageSize = 50;
        public int Page { get; init; } = 1;

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            init => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public Guid? FreelancerID { get; init; }
        public Guid? ContractID { get; init; }

         // Advanced Search Filters
        public int? MinRating { get; init; }
        public int? MaxRating { get; init; } = 5;
        public string? SearchComment { get; init; }  
        public string? SortBy { get; init; } = "createdAt";  
        public string? SortOrder { get; init; } = "desc";  
        public Guid? ClientID { get; init; }
    }
}
