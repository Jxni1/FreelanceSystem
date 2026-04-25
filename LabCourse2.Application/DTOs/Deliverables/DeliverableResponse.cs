
namespace LabCourse2.Application.DTOs.Deliverables
{
    public class DeliverableResponse
    {
        public Guid DeliverablesID { get; init; }
        public DateTime Submitted_at { get; init; }
        public DateTime? Approved_at { get; init; }

        public Guid MilestoneID { get; init; }
        public string MilestoneTitle { get; init; } = string.Empty;
        public string MilestoneStatus { get; init; } = string.Empty;

      
        public Guid FileID { get; init; }
        public string FileName { get; init; } = string.Empty;
        public string FileUrl { get; init; } = string.Empty;

        public bool IsApproved { get; init; }
        public bool IsPendingReview { get; init; }
    }
}
