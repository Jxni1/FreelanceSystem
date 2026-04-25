
using LabCourse2.Application.DTOs.Deliverables;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class DeliverableMappingExtensions
    {
        public static DeliverableResponse ToResponse(this Deliverables deliverable) =>
            new()
            {
                DeliverablesID = deliverable.DeliverablesID,
                Submitted_at = deliverable.Submitted_at,
                Approved_at = deliverable.Approved_at,

               
                MilestoneID = deliverable.MilestoneID,
                MilestoneTitle = deliverable.Milestone?.Title ?? string.Empty,
                MilestoneStatus = deliverable.Milestone?.status ?? string.Empty,

                FileID = deliverable.FileID,
                FileName = deliverable.File?.Filename ?? string.Empty,
                FileUrl = deliverable.File?.File_Path ?? string.Empty,
                FileSize = deliverable.File?.File_Size ?? 0,
                UploadedBy = deliverable.File?.Uploaded_by ?? string.Empty,

                IsApproved = deliverable.Approved_at.HasValue,
                IsPendingReview = !deliverable.Approved_at.HasValue
            };

        public static Deliverables ToEntity(this CreateDeliverableRequest request) =>
            new()
            {
                DeliverablesID = Guid.NewGuid(),
                Submitted_at = DateTime.UtcNow,
                Approved_at = null,
                MilestoneID = request.MilestoneID,
                FileID = request.FileID
            };
    }
}
