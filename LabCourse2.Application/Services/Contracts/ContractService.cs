using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.Interfaces.Contracts;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Contracts
{
    public class ContractService : IContractService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public ContractService(IAppDbContext context, ICurrentUserService currentUser)
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

        public async Task<Result<PagedResult<ContractResponse>>> GetAllAsync(ContractQueryParams query)
        {
           
            var q = _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ClientID.HasValue)
                q = q.Where(c => c.ClientID == query.ClientID);

            if (query.FreelancerID.HasValue)
                q = q.Where(c => c.FreelancerID == query.FreelancerID);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(c => c.Start_Date)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ContractResponse>>.Success(new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<PagedResult<ContractResponse>>> GetContractsByClientIDAsync(ContractQueryParams query)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<PagedResult<ContractResponse>>.Forbidden("Only clients can view their contracts.");

            var q = _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .Where(c => c.ClientID == client.ClientID) // Only client's contracts
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(c => c.Start_Date)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ContractResponse>>.Success(new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<PagedResult<ContractResponse>>> GetContractsByFreelancerIDAsync(ContractQueryParams query)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<PagedResult<ContractResponse>>.Forbidden("Only freelancers can view their contracts.");

            var q = _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .Where(c => c.FreelancerID == freelancer.FreelancerID) // Only freelancer's contracts
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(c => c.Start_Date)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ContractResponse>>.Success(new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ContractResponse>> GetByIdAsync(Guid id)
        {
            var contract = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<ContractResponse>.NotFound($"Contract with ID {id} was not found.");

            return Result<ContractResponse>.Success(contract.ToResponse());
        }

        public async Task<Result<ContractResponse>> CreateAsync(CreateContractRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can create contracts.");

            var projectExists = await _context.Projects
                .AnyAsync(p => p.ProjectID == request.ProjectID);

            if (!projectExists)
                return Result<ContractResponse>.NotFound("Project not found.");

            var freelancerExists = await _context.FreelancerProfiles
                .AnyAsync(f => f.FreelancerID == request.FreelancerID);

            if (!freelancerExists)
                return Result<ContractResponse>.NotFound("Freelancer not found.");

            var contract = request.ToEntity(client.ClientID);

            await _context.Contracts.AddAsync(contract);
            await _context.SaveChangesAsync();

            var created = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            return Result<ContractResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ContractResponse>> UpdateAsync(Guid id, UpdateContractRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can update contracts.");

            var contract = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<ContractResponse>.NotFound($"Contract with ID {id} was not found.");

            if (contract.ClientID != client.ClientID)
                return Result<ContractResponse>.Forbidden("You do not own this contract.");

            contract.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            var updated = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            return Result<ContractResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<bool>.Forbidden("Only clients can delete contracts.");

            var contract = await _context.Contracts
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<bool>.NotFound($"Contract with ID {id} was not found.");

            if (contract.ClientID != client.ClientID)
                return Result<bool>.Forbidden("You do not own this contract.");

            _context.Contracts.Remove(contract);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
