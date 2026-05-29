using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces.Payments;
using LabCourse2.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace LabCourse2.Infrastructure.Services
{
    public class StripeService : IStripeService
    {
        private readonly StripeSettings _settings;

        public StripeService(IOptions<StripeSettings> settings)
        {
            _settings = settings.Value;
        }

        public string PublishableKey => _settings.PublishableKey;

        public async Task<StripeHealthResult> CheckConnectivityAsync(CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.SecretKey))
            {
                return new StripeHealthResult
                {
                    Connected = false,
                    Error = "Stripe SecretKey is not configured. Paste your test key into appsettings.Development.json."
                };
            }

            try
            {
                var balanceService = new BalanceService();
                var balance = await balanceService.GetAsync(cancellationToken: cancellationToken);

                return new StripeHealthResult
                {
                    Connected = true,
                    LiveMode = balance.Livemode
                };
            }
            catch (StripeException ex)
            {
                return new StripeHealthResult
                {
                    Connected = false,
                    Error = ex.StripeError?.Message ?? ex.Message
                };
            }
        }

        public Task<string> CreateConnectedAccountAsync(string email, CancellationToken cancellationToken = default) =>
            ExecuteAsync(async () =>
            {
                var options = new AccountCreateOptions
                {
                    Type = "express",
                    Country = _settings.PlatformCountry,
                    Email = email,
                    Capabilities = new AccountCapabilitiesOptions
                    {
                        Transfers = new AccountCapabilitiesTransfersOptions { Requested = true }
                    }
                };

                var account = await new AccountService().CreateAsync(options, cancellationToken: cancellationToken);
                return account.Id;
            });

        public Task<string> CreateOnboardingLinkAsync(string accountId, CancellationToken cancellationToken = default) =>
            ExecuteAsync(async () =>
            {
                var options = new AccountLinkCreateOptions
                {
                    Account = accountId,
                    RefreshUrl = _settings.ConnectRefreshUrl,
                    ReturnUrl = _settings.ConnectReturnUrl,
                    Type = "account_onboarding"
                };

                var link = await new AccountLinkService().CreateAsync(options, cancellationToken: cancellationToken);
                return link.Url;
            });

        public Task<StripeAccountStatus> GetAccountStatusAsync(string accountId, CancellationToken cancellationToken = default) =>
            ExecuteAsync(async () =>
            {
                var account = await new AccountService().GetAsync(accountId, cancellationToken: cancellationToken);

                return new StripeAccountStatus
                {
                    PayoutsEnabled = account.PayoutsEnabled,
                    ChargesEnabled = account.ChargesEnabled,
                    DetailsSubmitted = account.DetailsSubmitted,
                    TransfersEnabled = account.Capabilities?.Transfers == "active",
                    DisabledReason = account.Requirements?.DisabledReason,
                    CurrentlyDue = account.Requirements?.CurrentlyDue?.ToList() ?? new List<string>()
                };
            });

        public Task<CheckoutSessionResult> CreateCheckoutSessionAsync(CheckoutSessionRequest request, CancellationToken cancellationToken = default) =>
            ExecuteAsync(async () =>
            {
                var metadata = new Dictionary<string, string>
                {
                    ["paymentId"] = request.PaymentId.ToString(),
                    ["milestoneId"] = request.MilestoneId.ToString()
                };

                var options = new SessionCreateOptions
                {
                    Mode = "payment",
                    ClientReferenceId = request.PaymentId.ToString(),
                    SuccessUrl = _settings.CheckoutSuccessUrl,
                    CancelUrl = _settings.CheckoutCancelUrl,
                    Metadata = metadata,
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new()
                        {
                            Quantity = 1,
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = _settings.Currency,
                                UnitAmount = ToMinorUnits(request.Amount),
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = request.ProductName
                                }
                            }
                        }
                    },
                    PaymentIntentData = new SessionPaymentIntentDataOptions
                    {
                        Metadata = metadata
                    }
                };

                var session = await new SessionService().CreateAsync(options, cancellationToken: cancellationToken);

                return new CheckoutSessionResult
                {
                    SessionId = session.Id,
                    Url = session.Url,
                    PaymentIntentId = session.PaymentIntentId,
                    Currency = _settings.Currency
                };
            });

        public Task<TransferResult> CreateTransferAsync(TransferRequest request, CancellationToken cancellationToken = default) =>
            ExecuteAsync(async () =>
            {
                var net = request.Amount * (1m - _settings.PlatformFeePercent / 100m);

                string? sourceCharge = null;
                if (!string.IsNullOrEmpty(request.PaymentIntentId))
                {
                    var intent = await new PaymentIntentService()
                        .GetAsync(request.PaymentIntentId, cancellationToken: cancellationToken);
                    sourceCharge = intent.LatestChargeId;
                }

                var options = new TransferCreateOptions
                {
                    Amount = ToMinorUnits(net),
                    Currency = _settings.Currency,
                    Destination = request.DestinationAccountId,
                    Metadata = new Dictionary<string, string>
                    {
                        ["paymentId"] = request.PaymentId.ToString(),
                        ["milestoneId"] = request.MilestoneId.ToString()
                    }
                };

                if (!string.IsNullOrEmpty(sourceCharge))
                    options.SourceTransaction = sourceCharge;

                var requestOptions = new RequestOptions
                {
                    IdempotencyKey = string.IsNullOrEmpty(sourceCharge)
                        ? $"transfer-{request.PaymentId}-v2"
                        : $"transfer-{request.PaymentId}-{sourceCharge}"
                };

                var transfer = await new TransferService().CreateAsync(options, requestOptions, cancellationToken);

                return new TransferResult
                {
                    TransferId = transfer.Id,
                    Amount = net,
                    Currency = _settings.Currency
                };
            });

        public StripeWebhookEvent? ConstructWebhookEvent(string json, string signatureHeader)
        {
            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(
                    json, signatureHeader, _settings.WebhookSecret, throwOnApiVersionMismatch: false);
            }
            catch (StripeException ex)
            {
                throw new PaymentProviderException("Invalid Stripe webhook signature.", ex);
            }

            var result = new StripeWebhookEvent
            {
                Id = stripeEvent.Id,
                Type = stripeEvent.Type
            };

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                case "checkout.session.expired":
                    if (stripeEvent.Data.Object is Session session)
                    {
                        result.CheckoutSessionId = session.Id;
                        result.PaymentIntentId = session.PaymentIntentId;
                        result.PaymentStatus = session.PaymentStatus;
                        if (session.Metadata is not null)
                        {
                            session.Metadata.TryGetValue("paymentId", out var paymentId);
                            result.PaymentId = paymentId;
                            session.Metadata.TryGetValue("milestoneId", out var milestoneId);
                            result.MilestoneId = milestoneId;
                        }
                    }
                    return result;

                case "account.updated":
                    if (stripeEvent.Data.Object is Account account)
                    {
                        result.ConnectedAccountId = account.Id;
                        result.PayoutsEnabled = account.PayoutsEnabled;
                        result.TransfersEnabled = account.Capabilities?.Transfers == "active";
                    }
                    return result;

                default:
                    return null;
            }
        }

        private static long ToMinorUnits(decimal amount) =>
            (long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

        private static async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
        {
            try
            {
                return await action();
            }
            catch (StripeException ex)
            {
                throw new PaymentProviderException(ex.StripeError?.Message ?? ex.Message, ex);
            }
        }
    }
}
