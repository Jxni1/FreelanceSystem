namespace LabCourse2.Application.DTOs.Proposals
{
    public class ProposalQueryParams
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
        public Guid? ProjectId { get; set; }

        //Advanced Search Filters
        public decimal? MinBidAmount { get; set; }
        public decimal? MaxBidAmount { get; set; }
        public int? MinDeliveryDays { get; set; }
        public int? MaxDeliveryDays { get; set; }
        public string? SearchMessage { get; set; }  
        public string? SortBy { get; set; } = "createdAt"; 
        public string? SortOrder { get; set; } = "desc"; 
        public Guid? FreelancerId { get; set; }
    }
}