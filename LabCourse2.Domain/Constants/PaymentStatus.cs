namespace LabCourse2.Domain.Constants
{
    public static class PaymentStatus
    {
        public const string Pending = "Pending";
        public const string Released = "Released";

        public static readonly IReadOnlyList<string> All =
            new[] { Pending, Released };
    }
}
