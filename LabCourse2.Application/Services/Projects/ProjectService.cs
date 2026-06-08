using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Projects;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Projects
{
    public class ProjectService : IProjectService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly ICacheService _cacheService;

        public ProjectService(IAppDbContext context, ICurrentUserService currentUser, ICacheService cacheService)
        {
            _context = context;
            _currentUser = currentUser;
            _cacheService = cacheService;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ProjectResponse>>> GetAllAsync(ProjectQueryParams query)
        {
            var search = query.Search ?? "null";
            var categoryId = query.CategoryID?.ToString() ?? "null";
            var status = query.Status ?? "null";
            var visibility = query.Visibility ?? "null";
            var cacheKey = $"projects_all_{query.Page}_{query.PageSize}_{search}_{categoryId}_{status}_{visibility}";
            
          
            var cached = await _cacheService.GetAsync<PagedResult<ProjectResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<ProjectResponse>>.Success(cached);

            var q = _context.Projects
                .Include(p => p.Category)
                .AsNoTracking()
                .AsQueryable();

            var clientProfile = await GetClientProfileAsync();
            if (clientProfile != null)
            {
                q = q.Where(p => p.ClientID == clientProfile.ClientID);
            }


            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(p => p.Title.Contains(query.Search));

            if (query.CategoryID.HasValue)
                q = q.Where(p => p.CategoryID == query.CategoryID);

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(p => p.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.Visibility))
                q = q.Where(p => p.Visibility == query.Visibility);

            if (!string.IsNullOrWhiteSpace(query.Skill))
                q = q.Where(p => _context.ProjectSkills
                    .Any(ps => ps.ProjectID == p.ProjectID &&
                               ps.Skill.Name.Contains(query.Skill)));

            if (query.SkillNames != null && query.SkillNames.Count > 0)
                q = q.Where(p => _context.ProjectSkills
                    .Any(ps => ps.ProjectID == p.ProjectID &&
                               query.SkillNames.Contains(ps.Skill.Name)));

            var totalCount = await q.CountAsync();

            var rawItems = await q
                .OrderByDescending(p => p.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var projectIds = rawItems.Select(p => p.ProjectID).ToList();
            var skillEntries = await _context.ProjectSkills
                .Where(ps => projectIds.Contains(ps.ProjectID))
                .Select(ps => new { ps.ProjectID, ps.Skill.Name })
                .ToListAsync();

            var skillsMap = skillEntries
                .GroupBy(x => x.ProjectID)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Name).ToList());

            var items = rawItems
                .Select(p => p.ToResponse(skillsMap.GetValueOrDefault(p.ProjectID)))
                .ToList();

            var result = new PagedResult<ProjectResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            
            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromHours(1));

            return Result<PagedResult<ProjectResponse>>.Success(result);
        }

        public async Task<Result<ProjectResponse>> GetByIdAsync(Guid id)
        {
            var cacheKey = $"project_{id}";
            
            var cached = await _cacheService.GetAsync<ProjectResponse>(cacheKey);
            if (cached != null)
                return Result<ProjectResponse>.Success(cached);

            var project = await _context.Projects
                .Include(p => p.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProjectID == id);

            if (project is null)
                return Result<ProjectResponse>.NotFound($"Project with ID {id} was not found.");

            var skills = await _context.ProjectSkills
                .Where(ps => ps.ProjectID == id)
                .Select(ps => ps.Skill.Name)
                .ToListAsync();

            var response = project.ToResponse(skills);
            
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(1));

            return Result<ProjectResponse>.Success(response);
        }

        public async Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ProjectResponse>.Forbidden("Only clients can create projects.");

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryID == request.CategoryID);

            if (!categoryExists)
                return Result<ProjectResponse>.NotFound("Category not found.");

            var project = request.ToEntity(client.ClientID);

            await _context.Projects.AddAsync(project);

            if (request.SkillIds != null && request.SkillIds.Count > 0)
            {
                var validSkillIds = await _context.Skills
                    .Where(s => request.SkillIds.Contains(s.SkillsID))
                    .Select(s => s.SkillsID)
                    .ToListAsync();

                foreach (var sid in validSkillIds)
                    _context.ProjectSkills.Add(new Domain.Entities.ProjectSkills
                    {
                        ProjectSkillsID = Guid.NewGuid(),
                        ProjectID = project.ProjectID,
                        SkillID = sid
                    });
            }

            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                UserID = client.UserID,
                Type = "ProjectCreated",
                Title = "Project created",
                Message = $"Your project \"{project.Title}\" was created successfully.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            var created = await _context.Projects
                .Include(p => p.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProjectID == project.ProjectID);

            await _cacheService.RemoveByPatternAsync("projects_all_*");

            return Result<ProjectResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ProjectResponse>> UpdateAsync(Guid id, UpdateProjectRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ProjectResponse>.Forbidden("Only clients can update projects.");

            var project = await _context.Projects
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProjectID == id);

            if (project is null)
                return Result<ProjectResponse>.NotFound($"Project with ID {id} was not found.");

            if (project.ClientID != client.ClientID)
                return Result<ProjectResponse>.Forbidden("You do not own this project.");

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryID == request.CategoryID);

            if (!categoryExists)
                return Result<ProjectResponse>.NotFound("Category not found.");

            var oldStatus = project.Status;

            project.ApplyUpdate(request);

            var existingSkills = await _context.ProjectSkills
                .Where(ps => ps.ProjectID == id)
                .ToListAsync();
            _context.ProjectSkills.RemoveRange(existingSkills);

            if (request.SkillIds != null && request.SkillIds.Count > 0)
            {
                var validSkillIds = await _context.Skills
                    .Where(s => request.SkillIds.Contains(s.SkillsID))
                    .Select(s => s.SkillsID)
                    .ToListAsync();

                foreach (var sid in validSkillIds)
                    _context.ProjectSkills.Add(new Domain.Entities.ProjectSkills
                    {
                        ProjectSkillsID = Guid.NewGuid(),
                        ProjectID = project.ProjectID,
                        SkillID = sid
                    });
            }

            if (!string.Equals(oldStatus, project.Status, StringComparison.OrdinalIgnoreCase))
            {
                var notification = new Notification
                {
                    NotificationID = Guid.NewGuid(),
                    UserID = client.UserID,
                    Type = "ProjectStatusChanged",
                    Title = "Project status updated",
                    Message = $"Your project \"{project.Title}\" status changed from {oldStatus} to {project.Status}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            var updated = await _context.Projects
                .Include(p => p.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProjectID == project.ProjectID);

            await _cacheService.RemoveByPatternAsync("projects_all_*");
            await _cacheService.RemoveAsync($"project_{id}");

            return Result<ProjectResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<bool>.Forbidden("Only clients can delete projects.");

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectID == id);

            if (project is null)
                return Result<bool>.NotFound($"Project with ID {id} was not found.");

            if (project.ClientID != client.ClientID)
                return Result<bool>.Forbidden("You do not own this project.");

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            await _cacheService.RemoveByPatternAsync("projects_all_*");
            await _cacheService.RemoveAsync($"project_{id}");

            return Result<bool>.Success(true);
        }
    }
}