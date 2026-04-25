
namespace LabCourse2.Application.DTOs.Milestones
{
    public class MilestoneQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? Status { get; set; }   // filter by status
        public Guid? ContractID { get; set; } // filter by contract
    }
}
