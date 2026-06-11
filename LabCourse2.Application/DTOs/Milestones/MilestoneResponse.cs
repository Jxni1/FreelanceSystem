namespace LabCourse2.Application.DTOs.Milestones
{
    public class MilestoneResponse
    {
        public Guid MilestoneID { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Amount { get; init; }
        public DateTime DueDate { get; init; }
        public string Status { get; init; } = string.Empty;
        public Guid ContractID { get; init; }
        public int OrderIndex { get; init; }
        public DateTime? FundedAt { get; init; }
        public DateTime? SubmittedAt { get; init; }
        public DateTime? ApprovedAt { get; init; }
        public bool IsOverdue { get; init; }
        public string? SubmissionNote { get; init; }
        public string? RejectionNote { get; init; }
        public int TotalDeliverables { get; init; }
        public int ApprovedDeliverables { get; init; }
        public bool AllDeliverablesApproved { get; init; }
    }
}
