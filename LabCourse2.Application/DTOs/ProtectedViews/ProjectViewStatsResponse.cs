namespace LabCourse2.Application.DTOs.ProtectedViews
{
    public class ProjectViewStatsResponse
    {
        public Guid ProjectID { get; init; }
        public string ProjectTitle { get; init; } = string.Empty;
        public int TotalViews { get; init; }
        public int UniqueViewers { get; init; }
    }
}