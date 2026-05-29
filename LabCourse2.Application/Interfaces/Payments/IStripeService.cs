using LabCourse2.Application.DTOs.Payments;

namespace LabCourse2.Application.Interfaces.Payments
{
    public interface IStripeService
    {
        string PublishableKey { get; }

        Task<StripeHealthResult> CheckConnectivityAsync(CancellationToken cancellationToken = default);

        Task<string> CreateConnectedAccountAsync(string email, CancellationToken cancellationToken = default);

        Task<string> CreateOnboardingLinkAsync(string accountId, CancellationToken cancellationToken = default);

        Task<StripeAccountStatus> GetAccountStatusAsync(string accountId, CancellationToken cancellationToken = default);

        Task<CheckoutSessionResult> CreateCheckoutSessionAsync(CheckoutSessionRequest request, CancellationToken cancellationToken = default);

        Task<TransferResult> CreateTransferAsync(TransferRequest request, CancellationToken cancellationToken = default);

        StripeWebhookEvent? ConstructWebhookEvent(string json, string signatureHeader);
    }
}
