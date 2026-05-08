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
    }
}
