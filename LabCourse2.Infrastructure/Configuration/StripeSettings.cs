namespace LabCourse2.Infrastructure.Configuration
{
    public class StripeSettings
    {
        public const string SectionName = "Stripe";

        public string SecretKey { get; set; } = string.Empty;

        public string PublishableKey { get; set; } = string.Empty;

        public string WebhookSecret { get; set; } = string.Empty;

        public string Currency { get; set; } = "chf";

        public string PlatformCountry { get; set; } = "CH";

        public decimal PlatformFeePercent { get; set; }

        public string ConnectReturnUrl { get; set; } = string.Empty;

        public string ConnectRefreshUrl { get; set; } = string.Empty;

        public string CheckoutSuccessUrl { get; set; } = string.Empty;

        public string CheckoutCancelUrl { get; set; } = string.Empty;
    }
}
