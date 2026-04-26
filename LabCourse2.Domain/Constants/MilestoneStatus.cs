
namespace LabCourse2.Domain.Constants
{
    public static class MilestoneStatus
    {
        public const string Pending = "Pending";
        public const string InProgress = "InProgress";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static readonly IReadOnlyList<string> All =
            new[] { Pending, InProgress, Completed, Cancelled };
    }
}
