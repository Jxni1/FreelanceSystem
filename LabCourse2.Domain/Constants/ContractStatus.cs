namespace LabCourse2.Domain.Constants
{
    public static class ContractStatus
    {
        public const string Active = "Active";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
        public const string Pending = "Pending";

        public static readonly IReadOnlyList<string> All =
            new[] { Active, Completed, Cancelled, Pending };
    }
}
