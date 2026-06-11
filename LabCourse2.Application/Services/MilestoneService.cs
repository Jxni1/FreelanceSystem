using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Milestones;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Payments;
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
        private readonly IStripeService _stripe;
        private readonly INotificationCreator _notificationCreator;
        private readonly IAuditLogService _auditLog;

        public MilestoneService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            IStripeService stripe,
            INotificationCreator notificationCreator,
            IAuditLogService auditLog)
        {
            _context = context;
            _currentUser = currentUser;
            _stripe = stripe;
            _notificationCreator = notificationCreator;
            _auditLog = auditLog;
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

        public async Task<Result<FundMilestoneResponse>> FundAsync(
            Guid milestoneId, FundMilestoneRequest request)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<FundMilestoneResponse>.Forbidden("Only clients can fund milestones.");

            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<FundMilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            var contract = await GetContractForClientAsync(milestone.ContractID, client.ClientID);
            if (contract is null)
                return Result<FundMilestoneResponse>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status != MilestoneStatus.Draft && milestone.status != MilestoneStatus.PendingPayment)
                return Result<FundMilestoneResponse>
                    .Conflict($"Milestone must be in Draft status to fund. Current status: {milestone.status}.");

            var freelancer = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.FreelancerID == contract.FreelancerID);

            if (freelancer is null || string.IsNullOrEmpty(freelancer.StripeAccountId))
                return Result<FundMilestoneResponse>
                    .Conflict("The freelancer hasn't connected a Stripe payout account yet.");

            try
            {
                var accountStatus = await _stripe.GetAccountStatusAsync(freelancer.StripeAccountId);
                if (!accountStatus.TransfersEnabled)
                    return Result<FundMilestoneResponse>
                        .Conflict("The freelancer's payout account can't receive transfers yet.");

                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.MilestoneID == milestoneId
                                           && p.Status == PaymentStatus.RequiresPayment);

                if (payment is null)
                {
                    payment = new Payment
                    {
                        PaymentID = Guid.NewGuid(),
                        Payment_method = "stripe_checkout",
                        Status = PaymentStatus.RequiresPayment,
                        Payment_Date = DateTime.UtcNow,
                        Amount = milestone.Amount,
                        ContractID = milestone.ContractID,
                        MilestoneID = milestone.MilestoneID
                    };

                    await _context.Payments.AddAsync(payment);
                }

                var session = await _stripe.CreateCheckoutSessionAsync(new CheckoutSessionRequest
                {
                    PaymentId = payment.PaymentID,
                    MilestoneId = milestone.MilestoneID,
                    Amount = milestone.Amount,
                    ProductName = $"Milestone: {milestone.Title}"
                });

                payment.StripeCheckoutSessionId = session.SessionId;
                payment.StripePaymentIntentId = session.PaymentIntentId;
                payment.Currency = session.Currency;

                milestone.status = MilestoneStatus.PendingPayment;

                await _context.SaveChangesAsync();

                return Result<FundMilestoneResponse>.Created(new FundMilestoneResponse
                {
                    PaymentId = payment.PaymentID,
                    CheckoutUrl = session.Url,
                    CheckoutSessionId = session.SessionId,
                    Status = payment.Status
                });
            }
            catch (PaymentProviderException ex)
            {
                return Result<FundMilestoneResponse>.Failure(ex.Message);
            }
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
            milestone.Rejection_Note = null;
            milestone.status = MilestoneStatus.Submitted;
            milestone.Submitted_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditLog.LogAsync(
                action: AuditAction.MilestoneSubmitted,
                entity: "Milestone",
                oldValue: MilestoneStatus.Funded,
                newValue: MilestoneStatus.Submitted,
                entityId: milestone.MilestoneID,
                userId: _currentUser.UserId);

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
                .FirstOrDefaultAsync(p => p.MilestoneID == milestoneId && p.Status == PaymentStatus.Held);

            if (payment is null)
                return Result<MilestoneResponse>
                    .Failure("No held payment found for this milestone.");

            var freelancer = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.FreelancerID == contract.FreelancerID);

            if (freelancer is null || string.IsNullOrEmpty(freelancer.StripeAccountId))
                return Result<MilestoneResponse>
                    .Conflict("The freelancer doesn't have a connected payout account.");

            try
            {
                var transfer = await _stripe.CreateTransferAsync(new TransferRequest
                {
                    DestinationAccountId = freelancer.StripeAccountId,
                    Amount = payment.Amount,
                    PaymentId = payment.PaymentID,
                    MilestoneId = milestone.MilestoneID,
                    PaymentIntentId = payment.StripePaymentIntentId
                });

                payment.Status = PaymentStatus.Released;
                payment.StripeTransferId = transfer.TransferId;

                _context.Transactions.Add(new Transactions
                {
                    TransactionsID = Guid.NewGuid(),
                    Type = TransactionType.Release,
                    Amount = transfer.Amount,
                    Status = "completed",
                    Reference = transfer.TransferId,
                    PaymentID = payment.PaymentID,
                    MilestoneID = milestone.MilestoneID
                });

                milestone.status = MilestoneStatus.Approved;
                milestone.Approved_at = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await _auditLog.LogAsync(
                    action: AuditAction.PaymentReleased,
                    entity: "Payment",
                    oldValue: PaymentStatus.Held,
                    newValue: $"{PaymentStatus.Released} ({transfer.Amount:0.00})",
                    entityId: payment.PaymentID,
                    userId: _currentUser.UserId);

                await _auditLog.LogAsync(
                    action: AuditAction.MilestoneApproved,
                    entity: "Milestone",
                    oldValue: MilestoneStatus.Submitted,
                    newValue: MilestoneStatus.Approved,
                    entityId: milestone.MilestoneID,
                    userId: _currentUser.UserId);

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
            catch (PaymentProviderException ex)
            {
                return Result<MilestoneResponse>.Failure(ex.Message);
            }
        }

        public async Task<Result<MilestoneResponse>> RejectAsync(Guid milestoneId, RejectMilestoneRequest request)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<MilestoneResponse>.Forbidden("Only clients can reject milestones.");

            var milestone = await _context.Milestones
                .Include(m => m.Deliverables)
                .Include(m => m.Contract)
                    .ThenInclude(c => c.Freelancer)
                        .ThenInclude(f => f.User)
                .FirstOrDefaultAsync(m => m.MilestoneID == milestoneId);

            if (milestone is null)
                return Result<MilestoneResponse>
                    .NotFound($"Milestone with ID {milestoneId} was not found.");

            if (milestone.Contract.ClientID != client.ClientID)
                return Result<MilestoneResponse>
                    .Forbidden("You do not own the contract of this milestone.");

            if (milestone.status != MilestoneStatus.Submitted)
                return Result<MilestoneResponse>
                    .Conflict($"Milestone must be in Submitted status to reject. Current status: {milestone.status}.");

            var reason = string.IsNullOrWhiteSpace(request.Reason) ? null : request.Reason.Trim();

            if (milestone.Deliverables.Any())
                _context.Deliverables.RemoveRange(milestone.Deliverables);

            milestone.status = MilestoneStatus.Funded;
            milestone.Submitted_at = null;
            milestone.Submission_Note = null;
            milestone.Rejection_Note = reason;

            await _context.SaveChangesAsync();

            await _auditLog.LogAsync(
                action: AuditAction.MilestoneRejected,
                entity: "Milestone",
                oldValue: MilestoneStatus.Submitted,
                newValue: reason is null ? MilestoneStatus.Funded : $"{MilestoneStatus.Funded} ({reason})",
                entityId: milestone.MilestoneID,
                userId: _currentUser.UserId);

            var freelancerUserId = milestone.Contract.Freelancer?.User?.UserID;
            if (freelancerUserId.HasValue)
            {
                var message = reason is null
                    ? $"Your submission for milestone \"{milestone.Title}\" was rejected. You can submit again."
                    : $"Your submission for milestone \"{milestone.Title}\" was rejected: {reason}. You can submit again.";

                await _notificationCreator.CreateAsync(
                    freelancerUserId.Value,
                    "MilestoneRejected",
                    "Submission rejected",
                    message);
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
