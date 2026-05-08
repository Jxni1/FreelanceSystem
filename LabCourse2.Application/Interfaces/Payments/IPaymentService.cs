using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;

namespace LabCourse2.Application.Interfaces.Payments
{
    public interface IPaymentService
    {
        Task<Result<PagedResult<PaymentResponse>>> GetByContractAsync(Guid contractId, int page, int pageSize);
        Task<Result<PaymentResponse>> GetByIdAsync(Guid id);
    }
}
