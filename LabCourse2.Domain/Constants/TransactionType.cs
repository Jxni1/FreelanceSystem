namespace LabCourse2.Domain.Constants
{
    // Must match the CK_Transactions_Type check constraint: ('deposit','release','refund')
    public static class TransactionType
    {
        public const string Deposit = "deposit";
        public const string Release = "release";
        public const string Refund = "refund";
    }
}
