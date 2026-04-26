namespace LabCourse2.Application.DTOs.Deliverables
{
    public class DeliverableQueryParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

      
        public bool? IsApproved { get; set; }
    }
}
