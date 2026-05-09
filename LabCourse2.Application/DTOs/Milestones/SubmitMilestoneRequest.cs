namespace LabCourse2.Application.DTOs.Milestones
{
    public class SubmitMilestoneRequest
    {
        public List<Guid> FileIds { get; init; } = new();
        public string? Note { get; init; }
    }
}
