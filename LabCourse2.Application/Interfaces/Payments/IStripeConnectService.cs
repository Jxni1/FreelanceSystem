using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;

namespace LabCourse2.Application.Interfaces.Payments
{
    public interface IStripeConnectService
    {
        Task<Result<ConnectOnboardingResponse>> StartOnboardingAsync();

        Task<Result<ConnectStatusResponse>> GetStatusAsync();
    }
}
