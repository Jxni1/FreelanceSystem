namespace LabCourse2.Application.DTOs.Reports
{
    public class ReportQueryParams
    {
        public string? Status { get; set; }
        public string? Entity { get; set; }
        public Guid? UserID { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}