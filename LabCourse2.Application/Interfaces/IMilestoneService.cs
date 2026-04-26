
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Milestones;

namespace LabCourse2.Application.Interfaces.Milestones
{
    public interface IMilestoneService
    {
        Task<Result<PagedResult<MilestoneResponse>>> GetAllByContractAsync(Guid contractId, MilestoneQueryParams query);
        Task<Result<MilestoneResponse>> GetByIdAsync(Guid milestoneId);
        Task<Result<MilestoneResponse>> CreateAsync(CreateMilestoneRequest request);
        Task<Result<MilestoneResponse>> UpdateAsync(Guid milestoneId, UpdateMilestoneRequest request);
        Task<Result<MilestoneResponse>> CompleteAsync(Guid milestoneId);
        Task<Result<bool>> DeleteAsync(Guid milestoneId);
    }
}
