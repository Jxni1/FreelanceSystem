namespace LabCourse2.Application.DTOs.ProtectedViews
{
    public class SuspiciousActivityResponse
    {
        public Guid UserID { get; init; }
        public string Username { get; init; } = string.Empty;
        public int ViewCount { get; init; }
        public DateTime PeriodStart { get; init; }
        public DateTime PeriodEnd { get; init; }
    }
}