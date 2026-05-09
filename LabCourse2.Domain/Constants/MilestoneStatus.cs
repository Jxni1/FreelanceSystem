
namespace LabCourse2.Domain.Constants
{
    public static class MilestoneStatus
    {
        public const string Draft = "Draft";
        public const string Funded = "Funded";
        public const string Submitted = "Submitted";
        public const string Approved = "Approved";
        public const string Cancelled = "Cancelled";

        public static readonly IReadOnlyList<string> All =
            new[] { Draft, Funded, Submitted, Approved, Cancelled };
    }
}
