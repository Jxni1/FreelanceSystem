using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.DTOs.Payments;

namespace LabCourse2.Application.Interfaces.Milestones
{
    public interface IMilestoneService
    {
        Task<Result<PagedResult<MilestoneResponse>>> GetAllByContractAsync(Guid contractId, MilestoneQueryParams query);
        Task<Result<MilestoneResponse>> GetByIdAsync(Guid milestoneId);
        Task<Result<MilestoneResponse>> CreateAsync(CreateMilestoneRequest request);
        Task<Result<MilestoneResponse>> UpdateAsync(Guid milestoneId, UpdateMilestoneRequest request);
        Task<Result<PaymentResponse>> FundAsync(Guid milestoneId, FundMilestoneRequest request);
        Task<Result<MilestoneResponse>> SubmitAsync(Guid milestoneId, SubmitMilestoneRequest request);
        Task<Result<MilestoneResponse>> ApproveAsync(Guid milestoneId);
        Task<Result<bool>> DeleteAsync(Guid milestoneId);
    }
}
