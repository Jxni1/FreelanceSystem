namespace LabCourse2.Domain.Constants
{
    public static class PaymentStatus
    {
        public const string RequiresPayment = "RequiresPayment";
        public const string Held = "Held";
        public const string Released = "Released";
        public const string Refunded = "Refunded";
        public const string Failed = "Failed";

        public static readonly IReadOnlyList<string> All =
            new[] { RequiresPayment, Held, Released, Refunded, Failed };
    }
}
