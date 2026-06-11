namespace LabCourse2.Domain.Constants
{
    public static class AuditAction
    {
        public const string UserRoleChanged = "UserRoleChanged";
        public const string PaymentHeld = "PaymentHeld";
        public const string PaymentReleased = "PaymentReleased";
        public const string PaymentFailed = "PaymentFailed";
        public const string MilestoneSubmitted = "MilestoneSubmitted";
        public const string MilestoneApproved = "MilestoneApproved";
        public const string MilestoneRejected = "MilestoneRejected";
        public const string ContractCancelled = "ContractCancelled";
    }
}
