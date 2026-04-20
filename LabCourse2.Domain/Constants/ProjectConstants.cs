namespace LabCourse2.Domain.Constants
{
    public static class ProjectStatus
    {
        public const string Open = "Open";
        public const string InProgress = "InProgress";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static readonly IReadOnlyList<string> All =
            new[] { Open, InProgress, Completed, Cancelled };
    }

    public static class ProjectVisibility
    {
        public const string Public = "Public";
        public const string Private = "Private";

        public static readonly IReadOnlyList<string> All =
            new[] { Public, Private };
    }
}