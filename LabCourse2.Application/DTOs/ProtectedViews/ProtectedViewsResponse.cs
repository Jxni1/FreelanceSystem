namespace LabCourse2.Application.DTOs.ProtectedViews
{
    public class ProtectedViewResponse
    {
        public Guid ProtectedViewID { get; init; }
        public DateTime ViewedAt { get; init; }
        public Guid ProjectID { get; init; }
        public string ProjectTitle { get; init; } = string.Empty;
        public Guid UserID { get; init; }
        public string Username { get; init; } = string.Empty;
    }
}