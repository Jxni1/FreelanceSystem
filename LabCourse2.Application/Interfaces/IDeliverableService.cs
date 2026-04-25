
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Deliverables;

namespace LabCourse2.Application.Interfaces.Deliverables
{
    public interface IDeliverableService
    {
       
        Task<Result<PagedResult<DeliverableResponse>>> GetAllByMilestoneAsync(
            Guid milestoneId, DeliverableQueryParams query);

      
        Task<Result<DeliverableResponse>> GetByIdAsync(Guid deliverableId);

        
        Task<Result<DeliverableResponse>> SubmitAsync(CreateDeliverableRequest request);

       
        Task<Result<DeliverableResponse>> UpdateAsync(Guid deliverableId, UpdateDeliverableRequest request);

        
        Task<Result<DeliverableResponse>> ApproveAsync(Guid deliverableId);

        Task<Result<bool>> RejectAsync(Guid deliverableId);

        
        Task<Result<bool>> DeleteAsync(Guid deliverableId);
    }
}
