namespace LabCourse2.Application.DTOs.Contracts
{
    public class ContractQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
        public string? Status { get; set; }
        public Guid? ClientID { get; set; }
        public Guid? FreelancerID { get; set; }
        public Guid? ProjectID { get; set; }

        //Advanced Search Filters
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? EndDateFrom { get; set; }
        public DateTime? EndDateTo { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; } = "startDate";  
        public string? SortOrder { get; set; } = "desc";  
        public string? Description { get; set; } 
    }
}