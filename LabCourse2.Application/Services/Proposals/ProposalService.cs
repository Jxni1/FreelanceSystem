using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Proposals;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using LabCourse2.Application.Utilities;

namespace LabCourse2.Application.Services.Proposals
{
    public class ProposalService : IProposalService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly INotificationCreator _notificationCreator;
        private readonly ICacheService _cacheService;

        public ProposalService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            INotificationCreator notificationCreator,
            ICacheService cacheService)
        {
            _context = context;
            _currentUser = currentUser;
            _notificationCreator = notificationCreator;
            _cacheService = cacheService;
        }

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ProposalResponse>>> GetAllAsync(ProposalQueryParams query)
        {
            var freelancer = await GetFreelancerProfileAsync();
            var client = await GetClientProfileAsync();

            if (freelancer is null && client is null)
                return Result<PagedResult<ProposalResponse>>
                    .Forbidden("You must have a freelancer or client profile.");

            var userContext = freelancer?.FreelancerID.ToString() ?? client!.ClientID.ToString();
            var status = query.Status ?? "null";
            var projectId = query.ProjectId?.ToString() ?? "null";
            var cacheKey = $"proposals_{userContext}_{query.Page}_{query.PageSize}_{status}_{projectId}";

            var cached = await _cacheService.GetAsync<PagedResult<ProposalResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<ProposalResponse>>.Success(cached);

            var q = _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .AsQueryable();
 
            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(p => p.Status == query.Status);

            if (query.ProjectId.HasValue)
                q = q.Where(p => p.ProjectId == query.ProjectId);

            if (query.FreelancerId.HasValue)
                q = q.Where(p => p.FreelancerId == query.FreelancerId);
 
            q = q.FilterByBidRange(query.MinBidAmount, query.MaxBidAmount);
 
            q = q.FilterByDeliveryDays(query.MinDeliveryDays, query.MaxDeliveryDays);
 
            q = q.SearchProposals(query.SearchMessage);

            var totalCount = await q.CountAsync();
 
            q = q.SortProposals(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => p.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ProposalResponse>>.Success(new PagedResult<ProposalResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ProposalResponse>> GetByIdAsync(Guid id)
        {
            var proposal = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProposalId == id);

            if (proposal is null)
                return Result<ProposalResponse>.NotFound($"Proposal with ID {id} was not found.");

            return Result<ProposalResponse>.Success(proposal.ToResponse());
        }

        public async Task<Result<ProposalResponse>> CreateAsync(CreateProposalRequest request)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<ProposalResponse>.Forbidden("Only freelancers can submit proposals.");

            var project = await _context.Projects
                .Include(p => p.Client)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(p => p.ProjectID == request.ProjectId);

            if (project is null)
                return Result<ProposalResponse>.NotFound($"Project with ID {request.ProjectId} was not found.");

            if (project.Status != ProjectStatus.Open)
                return Result<ProposalResponse>.Failure("Can only submit proposals to open projects.");

            var alreadyProposed = await _context.Proposals.AnyAsync(p =>
                p.ProjectId == request.ProjectId &&
                p.FreelancerId == freelancer.FreelancerID &&
                p.Status == ProposalStatus.Pending);

            if (alreadyProposed)
                return Result<ProposalResponse>.Conflict("You already have a pending proposal for this project.");

            var proposal = request.ToEntity(freelancer.FreelancerID);
            await _context.Proposals.AddAsync(proposal);
            await _context.SaveChangesAsync();

            var created = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProposalId == proposal.ProposalId);

            if (project.Client?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    project.Client.User.UserID,
                    "ProposalSubmitted",
                    "New proposal received",
                    $"A new proposal was submitted for your project \"{project.Title}\".");
            }

            await _cacheService.RemoveByPatternAsync("proposals_*");

            return Result<ProposalResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ContractResponse>> AcceptAsync(Guid proposalId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can accept proposals.");

            var proposal = await _context.Proposals
                .Include(p => p.Project)
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .FirstOrDefaultAsync(p => p.ProposalId == proposalId);

            if (proposal is null)
                return Result<ContractResponse>.NotFound($"Proposal with ID {proposalId} was not found.");

            if (proposal.Project.ClientID != client.ClientID)
                return Result<ContractResponse>.Forbidden("You do not own the project this proposal belongs to.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<ContractResponse>.Conflict($"Proposal is already {proposal.Status.ToLower()}.");

            var existingContract = await _context.Contracts
                .AnyAsync(c => c.ProposalID == proposalId);

            if (existingContract)
                return Result<ContractResponse>.Conflict("A contract already exists for this proposal.");

            proposal.Status = ProposalStatus.Accepted;

            var startDate = DateTime.UtcNow;
            var contract = new Contract
            {
                ContractID = Guid.NewGuid(),
                Description = proposal.Message,
                Start_Date = startDate,
                End_Date = startDate.AddDays(proposal.DeliveryDays),
                Agreed_Price = proposal.BidAmount,
                Status = ContractStatus.Active,
                ClientID = client.ClientID,
                FreelancerID = proposal.FreelancerId,
                ProjectID = proposal.ProjectId,
                ProposalID = proposal.ProposalId
            };

            await _context.Contracts.AddAsync(contract);

            var otherProposals = await _context.Proposals
                .Include(p => p.Freelancer)
                    .ThenInclude(f => f.User)
                .Where(p => p.ProjectId == proposal.ProjectId
                         && p.ProposalId != proposalId
                         && p.Status == ProposalStatus.Pending)
                .ToListAsync();

            foreach (var other in otherProposals)
                other.Status = ProposalStatus.Rejected;

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectID == proposal.ProjectId);

            if (project is not null)
                project.Status = ProjectStatus.InProgress;

            await _context.SaveChangesAsync();

            if (proposal.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    proposal.Freelancer.User.UserID,
                    "ProposalAccepted",
                    "Proposal accepted",
                    $"Your proposal for project \"{proposal.Project.Title}\" was accepted.");
            }

            var rejectedUserIds = otherProposals
                .Where(p => p.Freelancer?.User?.UserID != null)
                .Select(p => p.Freelancer!.User!.UserID)
                .Distinct()
                .ToList();

            if (rejectedUserIds.Any())
            {
                await _notificationCreator.CreateManyAsync(
                    rejectedUserIds,
                    "ProposalRejected",
                    "Proposal not selected",
                    $"Your proposal for project \"{proposal.Project.Title}\" was not selected.");
            }

            var created = await _context.Contracts
                .Include(c => c.Client).ThenInclude(cl => cl.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            await _cacheService.RemoveByPatternAsync("proposals_*");
            await _cacheService.RemoveByPatternAsync("contracts_*");

            return Result<ContractResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ProposalResponse>> RejectAsync(Guid proposalId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ProposalResponse>.Forbidden("Only clients can reject proposals.");

            var proposal = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.ProposalId == proposalId);

            if (proposal is null)
                return Result<ProposalResponse>.NotFound($"Proposal with ID {proposalId} was not found.");

            if (proposal.Project.ClientID != client.ClientID)
                return Result<ProposalResponse>.Forbidden("You do not own the project this proposal belongs to.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<ProposalResponse>.Conflict($"Proposal is already {proposal.Status.ToLower()}.");

            proposal.Status = ProposalStatus.Rejected;
            await _context.SaveChangesAsync();

            if (proposal.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    proposal.Freelancer.User.UserID,
                    "ProposalRejected",
                    "Proposal rejected",
                    $"Your proposal for project \"{proposal.Project.Title}\" was rejected.");
            }

            return Result<ProposalResponse>.Success(proposal.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<bool>.Forbidden("Only freelancers can delete their proposals.");

            var proposal = await _context.Proposals
                .FirstOrDefaultAsync(p => p.ProposalId == id);

            if (proposal is null)
                return Result<bool>.NotFound($"Proposal with ID {id} was not found.");

            if (proposal.FreelancerId != freelancer.FreelancerID)
                return Result<bool>.Forbidden("You do not own this proposal.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<bool>.Failure("Only pending proposals can be deleted.");

            _context.Proposals.Remove(proposal);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}