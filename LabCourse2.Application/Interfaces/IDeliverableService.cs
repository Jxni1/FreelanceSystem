// Application/Interfaces/Deliverables/IDeliverableService.cs
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Deliverables;

namespace LabCourse2.Application.Interfaces.Deliverables
{
    public interface IDeliverableService
    {
        // Get all deliverables under a milestone
        Task<Result<PagedResult<DeliverableResponse>>> GetAllByMilestoneAsync(
            Guid milestoneId, DeliverableQueryParams query);

        // Get single deliverable
        Task<Result<DeliverableResponse>> GetByIdAsync(Guid deliverableId);

        // Freelancer submits a deliverable
        Task<Result<DeliverableResponse>> SubmitAsync(CreateDeliverableRequest request);

        // Freelancer updates (resubmits) with a new file
        Task<Result<DeliverableResponse>> UpdateAsync(Guid deliverableId, UpdateDeliverableRequest request);

        // Client approves a deliverable
        Task<Result<DeliverableResponse>> ApproveAsync(Guid deliverableId);

        // Client rejects a deliverable so freelancer can resubmit
        Task<Result<bool>> RejectAsync(Guid deliverableId);

        // Freelancer deletes their own non-approved deliverable
        Task<Result<bool>> DeleteAsync(Guid deliverableId);
    }
}
