using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.ClientProfiles;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services
{
    public class ClientService : IClientService
    {
        private readonly IAppDbContext _context;

        public ClientService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<ClientResponse>>> GetAllAsync(ClientQueryParams query)
        {
            var q = _context.ClientProfiles
                .Include(cp => cp.User)
                .Include(cp => cp.Reviews)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                q = q.Where(cp =>
                    cp.User.Name.Contains(query.Search) ||
                    cp.User.Surname.Contains(query.Search) ||
                    cp.User.Username.Contains(query.Search));
            }

            if (!string.IsNullOrWhiteSpace(query.Industry))
            {
                q = q.Where(cp => cp.Industry.Contains(query.Industry));
            }

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(cp => cp.User.Name)
                .ThenBy(cp => cp.ClientID)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(cp => new ClientResponse
                {
                    ClientID = cp.ClientID,
                    Name = $"{cp.User.Name} {cp.User.Surname}".Trim(),
                    Username = cp.User.Username,
                    Bio = cp.Bio,
                    Industry = cp.Industry,
                    Budget = cp.Budget,
                    ReviewCount = cp.Reviews.Count,
                    AverageRating = cp.Reviews.Count > 0
                        ? Math.Round(cp.Reviews.Average(r => r.Rating), 1)
                        : 0
                })
                .ToListAsync();

            return Result<PagedResult<ClientResponse>>.Success(
                new PagedResult<ClientResponse>
                {
                    Items = items,
                    TotalCount = totalCount,
                    Page = query.Page,
                    PageSize = query.PageSize
                });
        }

        public async Task<Result<ClientResponse>> GetByIdAsync(Guid clientId)
        {
            var client = await _context.ClientProfiles
                .Include(cp => cp.User)
                .Include(cp => cp.Reviews)
                .AsNoTracking()
                .Where(cp => cp.ClientID == clientId)
                .Select(cp => new ClientResponse
                {
                    ClientID = cp.ClientID,
                    Name = $"{cp.User.Name} {cp.User.Surname}".Trim(),
                    Username = cp.User.Username,
                    Bio = cp.Bio,
                    Industry = cp.Industry,
                    Budget = cp.Budget,
                    ReviewCount = cp.Reviews.Count,
                    AverageRating = cp.Reviews.Count > 0
                        ? Math.Round(cp.Reviews.Average(r => r.Rating), 1)
                        : 0
                })
                .FirstOrDefaultAsync();

            if (client is null)
                return Result<ClientResponse>.NotFound("Client profile not found.");

            return Result<ClientResponse>.Success(client);
        }

        public async Task<Result<List<ClientProjectListResponse>>> GetProjectsByClientIdAsync(Guid clientId)
        {
            var clientExists = await _context.ClientProfiles
                .AsNoTracking()
                .AnyAsync(cp => cp.ClientID == clientId);

            if (!clientExists)
                return Result<List<ClientProjectListResponse>>.NotFound("Client profile not found.");

            var projects = await _context.Projects
                .AsNoTracking()
                .Where(p => p.ClientID == clientId)
                .Select(p => new ClientProjectListResponse
                {
                    ProjectID = p.ProjectID,
                    Title = p.Title,
                    Description = p.Description,
                    Budget = p.Budget,
                    Status = p.Status,
                    Visibility = p.Visibility,
                    CategoryName = p.Category != null ? p.Category.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Result<List<ClientProjectListResponse>>.Success(projects);
        }
    }
}