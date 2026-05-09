namespace LabCourse2.Application.DTOs.Proposals
{
    public class ProposalQueryParams
    {
        private const int MaxPageSize = 50;
        public int Page { get; init; } = 1;

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            init => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? Status { get; init; }
        public Guid? ProjectId { get; init; }
    }
}
