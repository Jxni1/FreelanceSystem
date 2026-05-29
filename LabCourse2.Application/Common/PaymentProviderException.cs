namespace LabCourse2.Application.Common
{
    public class PaymentProviderException : Exception
    {
        public PaymentProviderException(string message, Exception? inner = null)
            : base(message, inner)
        {
        }
    }
}
