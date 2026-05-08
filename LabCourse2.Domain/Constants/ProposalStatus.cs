namespace LabCourse2.Domain.Constants
{
    public static class ProposalStatus
    {
        public const string Pending = "Pending";
        public const string Accepted = "Accepted";
        public const string Rejected = "Rejected";

        public static readonly IReadOnlyList<string> All =
            new[] { Pending, Accepted, Rejected };
    }
}
