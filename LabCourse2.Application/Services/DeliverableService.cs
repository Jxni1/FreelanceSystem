
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Deliverables;
using LabCourse2.Application.Interfaces.Deliverables;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Deliverables
{
    public class DeliverableService : IDeliverableService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public DeliverableService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<DeliverableResponse>>> GetAllByMilestoneAsync(
            Guid milestoneId, DeliverableQueryParams query)
        {
            var milestoneExists = await _context.Milestones
                .AnyAsync(m => m.MilestoneID == milestoneId);

            if (!milestoneExists)
                return Result<PagedResult<DeliverableResponse>>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var q = _context.Deliverables
                .Include(d => d.Milestone)
                .Include(d => d.File)
                .Where(d => d.MilestoneID == milestoneId)
                .AsNoTracking()
                .AsQueryable();

            if (query.IsApproved.HasValue)
            {
                q = query.IsApproved.Value
                    ? q.Where(d => d.Approved_at != null)
                    : q.Where(d => d.Approved_at == null);
            }

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(d => d.Submitted_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return Result<PagedResult<DeliverableResponse>>.Success(
                new PagedResult<DeliverableResponse>
                {
                    Items = items.Select(d => d.ToResponse()),
                    TotalCount = totalCount,
                    Page = query.Page,
                    PageSize = query.PageSize
                });
        }

        public async Task<Result<DeliverableResponse>> GetByIdAsync(Guid deliverableId)
        {
            var deliverable = await _context.Deliverables
                .Include(d => d.Milestone)
                .Include(d => d.File)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverableId);

            if (deliverable is null)
                return Result<DeliverableResponse>
                    .NotFound($"Deliverable with ID {deliverableId} was not found.");

            return Result<DeliverableResponse>.Success(deliverable.ToResponse());
        }

        public async Task<Result<DeliverableResponse>> SubmitAsync(
            CreateDeliverableRequest request)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<DeliverableResponse>
                    .Forbidden("Only freelancers can submit deliverables.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .Include(m => m.Contract)
                .FirstOrDefaultAsync(m => m.MilestoneID == request.MilestoneID);

            if (milestone is null)
                return Result<DeliverableResponse>
                    .NotFound($"Milestone with ID {request.MilestoneID} was not found.");

            if (milestone.Contract.FreelancerID != freelancer.FreelancerID)
                return Result<DeliverableResponse>
                    .Forbidden("You are not the freelancer on this contract.");

            if (milestone.status != MilestoneStatus.Funded)
                return Result<DeliverableResponse>
                    .Failure("Milestone must be funded before submitting deliverables.");

            var fileExists = await _context.Files
                .AnyAsync(f => f.FilesID == request.FileID);
            if (!fileExists)
                return Result<DeliverableResponse>
                    .NotFound($"File with ID {request.FileID} was not found.");

            var deliverable = request.ToEntity();
            await _context.Deliverables.AddAsync(deliverable);
            await _context.SaveChangesAsync();

            var created = await _context.Deliverables
                .Include(d => d.Milestone)
                .Include(d => d.File)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverable.DeliverablesID);

            return Result<DeliverableResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<DeliverableResponse>> UpdateAsync(
            Guid deliverableId, UpdateDeliverableRequest request)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<DeliverableResponse>
                    .Forbidden("Only freelancers can update deliverables.");

            var deliverable = await _context.Deliverables
                .Include(d => d.Milestone)
                    .ThenInclude(m => m.Contract)
                .Include(d => d.File)
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverableId);

            if (deliverable is null)
                return Result<DeliverableResponse>
                    .NotFound($"Deliverable with ID {deliverableId} was not found.");

            if (deliverable.Milestone.Contract.FreelancerID != freelancer.FreelancerID)
                return Result<DeliverableResponse>
                    .Forbidden("You are not the freelancer on this contract.");

            if (deliverable.Approved_at.HasValue)
                return Result<DeliverableResponse>
                    .Failure("Cannot update an already approved deliverable.");

            if (deliverable.Milestone.status == MilestoneStatus.Approved ||
                deliverable.Milestone.status == MilestoneStatus.Cancelled)
                return Result<DeliverableResponse>
                    .Failure("Cannot update a deliverable on an approved or cancelled milestone.");

            var fileExists = await _context.Files
                .AnyAsync(f => f.FilesID == request.FileID);
            if (!fileExists)
                return Result<DeliverableResponse>
                    .NotFound($"File with ID {request.FileID} was not found.");

            deliverable.FileID = request.FileID;
            deliverable.Submitted_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updated = await _context.Deliverables
                .Include(d => d.Milestone)
                .Include(d => d.File)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverable.DeliverablesID);

            return Result<DeliverableResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<DeliverableResponse>> ApproveAsync(Guid deliverableId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<DeliverableResponse>
                    .Forbidden("Only clients can approve deliverables.");

            var deliverable = await _context.Deliverables
                .Include(d => d.Milestone)
                    .ThenInclude(m => m.Contract)
                .Include(d => d.File)
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverableId);

            if (deliverable is null)
                return Result<DeliverableResponse>
                    .NotFound($"Deliverable with ID {deliverableId} was not found.");

            if (deliverable.Milestone.Contract.ClientID != client.ClientID)
                return Result<DeliverableResponse>
                    .Forbidden("You do not own the contract of this deliverable.");

            if (deliverable.Approved_at.HasValue)
                return Result<DeliverableResponse>
                    .Conflict("Deliverable is already approved.");

            deliverable.Approved_at = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result<DeliverableResponse>.Success(deliverable.ToResponse());
        }

        public async Task<Result<bool>> RejectAsync(Guid deliverableId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<bool>.Forbidden("Only clients can reject deliverables.");

            var deliverable = await _context.Deliverables
                .Include(d => d.Milestone)
                    .ThenInclude(m => m.Contract)
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverableId);

            if (deliverable is null)
                return Result<bool>.NotFound($"Deliverable with ID {deliverableId} was not found.");

            if (deliverable.Milestone.Contract.ClientID != client.ClientID)
                return Result<bool>.Forbidden("You do not own the contract of this deliverable.");

            if (deliverable.Approved_at.HasValue)
                return Result<bool>.Conflict("Cannot reject an already approved deliverable.");

            _context.Deliverables.Remove(deliverable);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteAsync(Guid deliverableId)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<bool>.Forbidden("Only freelancers can delete their deliverables.");

            var deliverable = await _context.Deliverables
                .Include(d => d.Milestone)
                    .ThenInclude(m => m.Contract)
                .FirstOrDefaultAsync(d => d.DeliverablesID == deliverableId);

            if (deliverable is null)
                return Result<bool>.NotFound($"Deliverable with ID {deliverableId} was not found.");

            if (deliverable.Milestone.Contract.FreelancerID != freelancer.FreelancerID)
                return Result<bool>.Forbidden("You are not the freelancer on this contract.");

            if (deliverable.Approved_at.HasValue)
                return Result<bool>.Failure("Cannot delete an approved deliverable.");

            _context.Deliverables.Remove(deliverable);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
