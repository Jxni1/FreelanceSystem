using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces.Payments;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Payments
{
    public class StripeConnectService : IStripeConnectService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly IStripeService _stripe;

        public StripeConnectService(IAppDbContext context, ICurrentUserService currentUser, IStripeService stripe)
        {
            _context = context;
            _currentUser = currentUser;
            _stripe = stripe;
        }

        public async Task<Result<ConnectOnboardingResponse>> StartOnboardingAsync()
        {
            var freelancer = await _context.FreelancerProfiles
                .Include(f => f.User)
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

            if (freelancer is null)
                return Result<ConnectOnboardingResponse>.Forbidden("Only freelancers can set up payouts.");

            try
            {
                if (string.IsNullOrEmpty(freelancer.StripeAccountId))
                {
                    freelancer.StripeAccountId = await _stripe.CreateConnectedAccountAsync(freelancer.User.Email);
                    await _context.SaveChangesAsync();
                }

                var url = await _stripe.CreateOnboardingLinkAsync(freelancer.StripeAccountId!);

                return Result<ConnectOnboardingResponse>.Success(new ConnectOnboardingResponse { Url = url });
            }
            catch (PaymentProviderException ex)
            {
                return Result<ConnectOnboardingResponse>.Failure(ex.Message);
            }
        }

        public async Task<Result<ConnectStatusResponse>> GetStatusAsync()
        {
            var freelancer = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

            if (freelancer is null)
                return Result<ConnectStatusResponse>.Forbidden("Only freelancers can view payout status.");

            if (string.IsNullOrEmpty(freelancer.StripeAccountId))
                return Result<ConnectStatusResponse>.Success(new ConnectStatusResponse { HasAccount = false });

            try
            {
                var status = await _stripe.GetAccountStatusAsync(freelancer.StripeAccountId);

                if (freelancer.StripePayoutsEnabled != status.PayoutsEnabled)
                {
                    freelancer.StripePayoutsEnabled = status.PayoutsEnabled;
                    await _context.SaveChangesAsync();
                }

                return Result<ConnectStatusResponse>.Success(new ConnectStatusResponse
                {
                    HasAccount = true,
                    PayoutsEnabled = status.PayoutsEnabled,
                    ChargesEnabled = status.ChargesEnabled,
                    DetailsSubmitted = status.DetailsSubmitted,
                    TransfersEnabled = status.TransfersEnabled,
                    DisabledReason = status.DisabledReason,
                    CurrentlyDue = status.CurrentlyDue
                });
            }
            catch (PaymentProviderException ex)
            {
                return Result<ConnectStatusResponse>.Failure(ex.Message);
            }
        }
    }
}
