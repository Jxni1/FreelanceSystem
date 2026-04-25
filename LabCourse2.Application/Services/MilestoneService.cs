using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.Interfaces.Milestones;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Milestones
{
    public class MilestoneService : IMilestoneService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public MilestoneService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

       
        private async Task<Contract?> GetContractForClientAsync(Guid contractId, Guid clientId) =>
            await _context.Contracts
                .FirstOrDefaultAsync(c => c.ContractID == contractId
                                       && c.ClientID == clientId);

       
        public async Task<Result<PagedResult<MilestoneResponse>>> GetAllByContractAsync(
            Guid contractId, MilestoneQueryParams query)
        {
            var contractExists = await _context.Contracts
                .AnyAsync(c => c.ContractID == contractId);

            if (!contractExists)
                return Result<PagedResult<MilestoneResponse>>
                    .NotFound($"Contract with ID {contractId} was not found.");

            var q = _context.Milestones
                .Include(m => m.Deliverables)
                .Where(m => m.ContractID == contractId)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(m => m.status == query.Status);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(m => m.DueDate)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return Result<PagedResult<MilestoneResponse>>.Success(new PagedResult<MilestoneResponse>
            {
                Items = items.Select(m => m.ToResponse()),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

    
        public async Task<Result<MilestoneResponse>> GetByIdAsync(Guid milestoneId)
        {
            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            return Result<MilestoneResponse>.Success(milestone.ToResponse());
        }

     
        public async Task<Result<MilestoneResponse>> CreateAsync(CreateMilestoneRequest request)
        {
            
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<MilestoneResponse>
                    .Forbidden("Only clients can create milestones.");

          
            var contract = await GetContractForClientAsync(request.ContractID, client.ClientID);
            if (contract is null)
                return Result<MilestoneResponse>
                    .NotFound("Contract not found or you do not own this contract.");

           
            if (contract.Status == "Completed" || contract.Status == "Cancelled")
                return Result<MilestoneResponse>
                    .Failure("Cannot add milestones to a completed or cancelled contract.");

            var milestone = request.ToEntity();

            await _context.Milestones.AddAsync(milestone);
            await _context.SaveChangesAsync();

         
            var created = await _context.Milestones
                .Include(m => m.Deliverables)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MilestoneID == milestone.MilestoneID);

            return Result<MilestoneResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<MilestoneResponse>> UpdateAsync(
            Guid milestoneId, UpdateMilestoneRequest request)
        {
            
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<MilestoneResponse>
                    .Forbidden("Only clients can update milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

           
            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<MilestoneResponse>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status == MilestoneStatus.Completed)
                return Result<MilestoneResponse>
                    .Failure("Cannot update a completed milestone.");

            milestone.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            return Result<MilestoneResponse>.Success(milestone.ToResponse());
        }

        public async Task<Result<MilestoneResponse>> CompleteAsync(Guid milestoneId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<MilestoneResponse>
                    .Forbidden("Only clients can complete milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<MilestoneResponse>
                    .Forbidden("You do not own the contract of this milestone.");

          
            if (milestone.status == MilestoneStatus.Completed)
                return Result<MilestoneResponse>
                    .Conflict("Milestone is already completed.");

            if (!milestone.Deliverables.Any())
                return Result<MilestoneResponse>
                    .Failure("Milestone must have at least one deliverable before completing.");

            var allApproved = milestone.Deliverables.All(d => d.Approved_at.HasValue);
            if (!allApproved)
                return Result<MilestoneResponse>
                    .Failure("All deliverables must be approved before completing the milestone.");

            milestone.status = MilestoneStatus.Completed;
            await _context.SaveChangesAsync();

            return Result<MilestoneResponse>.Success(milestone.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid milestoneId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<bool>.Forbidden("Only clients can delete milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<bool>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<bool>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status == MilestoneStatus.Completed)
                return Result<bool>
                    .Failure("Cannot delete a completed milestone.");

            var hasApprovedDeliverables = milestone.Deliverables.Any(d => d.Approved_at.HasValue);
            if (hasApprovedDeliverables)
                return Result<bool>
                    .Failure("Cannot delete a milestone that has approved deliverables.");

            _context.Milestones.Remove(milestone);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
