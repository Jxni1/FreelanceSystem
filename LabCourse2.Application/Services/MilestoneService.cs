using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces.Milestones;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DeliverableEntity = LabCourse2.Domain.Entities.Deliverables;

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

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        private async Task<Contract?> GetContractForClientAsync(Guid contractId, Guid clientId) =>
            await _context.Contracts
                .FirstOrDefaultAsync(c => c.ContractID == contractId && c.ClientID == clientId);

        public async Task<Result<PagedResult<MilestoneResponse>>> GetAllByContractAsync(
            Guid contractId, MilestoneQueryParams query)
        {
            var contractExists = await _context.Contracts.AnyAsync(c => c.ContractID == contractId);

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
                .OrderBy(m => m.Order_Index)
                .ThenBy(m => m.DueDate)
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
                return Result<MilestoneResponse>.Forbidden("Only clients can create milestones.");

            var contract = await GetContractForClientAsync(request.ContractID, client.ClientID);
            if (contract is null)
                return Result<MilestoneResponse>
                    .NotFound("Contract not found or you do not own this contract.");

            if (contract.Status == ContractStatus.Completed || contract.Status == ContractStatus.Cancelled)
                return Result<MilestoneResponse>
                    .Failure("Cannot add milestones to a completed or cancelled contract.");

            var nextIndex = await _context.Milestones
                .Where(m => m.ContractID == request.ContractID)
                .CountAsync();

            var milestone = request.ToEntity();
            milestone.Order_Index = nextIndex;

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
                return Result<MilestoneResponse>.Forbidden("Only clients can update milestones.");

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

            if (milestone.status != MilestoneStatus.Draft)
                return Result<MilestoneResponse>
                    .Failure("Only draft milestones can be updated.");

            milestone.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            return Result<MilestoneResponse>.Success(milestone.ToResponse());
        }

        public async Task<Result<PaymentResponse>> FundAsync(
            Guid milestoneId, FundMilestoneRequest request)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<PaymentResponse>.Forbidden("Only clients can fund milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<PaymentResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<PaymentResponse>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status != MilestoneStatus.Draft)
                return Result<PaymentResponse>
                    .Conflict($"Milestone must be in Draft status to fund. Current status: {milestone.status}.");

            var payment = new Payment
            {
                PaymentID = Guid.NewGuid(),
                Payment_method = request.PaymentMethod,
                Status = PaymentStatus.Pending,
                Payment_Date = DateTime.UtcNow,
                Amount = milestone.Amount,
                ContractID = milestone.ContractID,
                MilestoneID = milestone.MilestoneID
            };

            await _context.Payments.AddAsync(payment);

            var transaction = new Transactions
            {
                TransactionsID = Guid.NewGuid(),
                Type = TransactionType.Deposit,
                Amount = milestone.Amount,
                Status = "completed",
                Reference = $"TXN-{Guid.NewGuid():N}",
                PaymentID = payment.PaymentID,
                MilestoneID = milestone.MilestoneID
            };

            await _context.Transactions.AddAsync(transaction);

            milestone.status = MilestoneStatus.Funded;
            milestone.Funded_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Result<PaymentResponse>.Created(payment.ToResponse());
        }

        public async Task<Result<MilestoneResponse>> SubmitAsync(
            Guid milestoneId, SubmitMilestoneRequest request)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<MilestoneResponse>.Forbidden("Only freelancers can submit milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .Include(m => m.Contract)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            if (milestone.Contract.FreelancerID != freelancer.FreelancerID)
                return Result<MilestoneResponse>
                    .Forbidden("You are not the freelancer on this contract.");

            if (milestone.status != MilestoneStatus.Funded)
                return Result<MilestoneResponse>
                    .Conflict($"Milestone must be in Funded status to submit. Current status: {milestone.status}.");

            var existingFileIds = await _context.Files
                .Where(f => request.FileIds.Contains(f.FilesID))
                .Select(f => f.FilesID)
                .ToListAsync();

            var missingFileIds = request.FileIds.Except(existingFileIds).ToList();
            if (missingFileIds.Any())
                return Result<MilestoneResponse>
                    .NotFound($"Files not found: {string.Join(", ", missingFileIds)}.");

            if (request.FileIds.Any())
            {
                var deliverables = request.FileIds.Select(fileId => new DeliverableEntity
                {
                    DeliverablesID = Guid.NewGuid(),
                    MilestoneID = milestone.MilestoneID,
                    FileID = fileId,
                    Submitted_at = DateTime.UtcNow
                }).ToList();

                await _context.Deliverables.AddRangeAsync(deliverables);
            }

            milestone.Submission_Note = request.Note?.Trim();
            milestone.status = MilestoneStatus.Submitted;
            milestone.Submitted_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updated = await _context.Milestones
                .Include(m => m.Deliverables)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            return Result<MilestoneResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<MilestoneResponse>> ApproveAsync(Guid milestoneId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<MilestoneResponse>.Forbidden("Only clients can approve milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await _context.Contracts
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.ContractID == milestone.ContractID
                                       && c.ClientID == client.ClientID);

            if (contract is null)
                return Result<MilestoneResponse>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status != MilestoneStatus.Submitted)
                return Result<MilestoneResponse>
                    .Conflict($"Milestone must be in Submitted status to approve. Current status: {milestone.status}.");

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.MilestoneID == milestoneId);

            if (payment is null)
                return Result<MilestoneResponse>
                    .Failure("No payment found for this milestone.");

            var releaseTransaction = new Transactions
            {
                TransactionsID = Guid.NewGuid(),
                Type = TransactionType.Release,
                Amount = milestone.Amount,
                Status = "completed",
                Reference = $"TXN-{Guid.NewGuid():N}",
                PaymentID = payment.PaymentID,
                MilestoneID = milestone.MilestoneID
            };

            await _context.Transactions.AddAsync(releaseTransaction);

            payment.Status = PaymentStatus.Released;

            milestone.status = MilestoneStatus.Approved;
            milestone.Approved_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var allApproved = await _context.Milestones
                .Where(m => m.ContractID == milestone.ContractID)
                .AllAsync(m => m.status == MilestoneStatus.Approved);

            if (allApproved)
            {
                contract.Status = ContractStatus.Completed;
                contract.Project.Status = ProjectStatus.Completed;
                await _context.SaveChangesAsync();
            }

            var updated = await _context.Milestones
                .Include(m => m.Deliverables)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            return Result<MilestoneResponse>.Success(updated!.ToResponse());
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
                return Result<bool>.NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<bool>.Forbidden("You do not own the contract of this milestone.");

            if (milestone.status != MilestoneStatus.Draft)
                return Result<bool>.Failure("Only draft milestones can be deleted.");

            _context.Milestones.Remove(milestone);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
