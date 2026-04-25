using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class MilestoneMappingExtensions
    {
        public static MilestoneResponse ToResponse(this Milestone milestone) =>
            new()
            {
                MilestoneID = milestone.MilestoneID,
                Title = milestone.Title,
                Description = milestone.Description,
                Amount = milestone.Amount,
                DueDate = milestone.DueDate,
                Status = milestone.status,
                ContractID = milestone.ContractID,

                IsOverdue = milestone.DueDate < DateTime.UtcNow
                            && milestone.status != MilestoneStatus.Completed
                            && milestone.status != MilestoneStatus.Cancelled,

                TotalDeliverables = milestone.Deliverables?.Count ?? 0,

                ApprovedDeliverables = milestone.Deliverables?
                    .Count(d => d.Approved_at.HasValue) ?? 0,

                AllDeliverablesApproved = milestone.Deliverables?.Any() == true
                    && milestone.Deliverables.All(d => d.Approved_at.HasValue)
            };

        public static Milestone ToEntity(this CreateMilestoneRequest request) =>
            new()
            {
                MilestoneID = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Amount = request.Amount,
                DueDate = request.DueDate,
                ContractID = request.ContractID,
                status = MilestoneStatus.Pending  
            };

        public static void ApplyUpdate(this Milestone milestone, UpdateMilestoneRequest request)
        {
            milestone.Title = request.Title;
            milestone.Description = request.Description;
            milestone.Amount = request.Amount;
            milestone.DueDate = request.DueDate;
            milestone.status = request.Status;
        }
    }
}
