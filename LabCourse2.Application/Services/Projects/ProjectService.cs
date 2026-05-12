using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Projects;
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

        public ProjectService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ProjectResponse>>> GetAllAsync(ProjectQueryParams query)
        {
            var q = _context.Projects
                .Include(p => p.Category)
                .AsNoTracking()
                .AsQueryable();

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

            return Result<PagedResult<ProjectResponse>>.Success(new PagedResult<ProjectResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ProjectResponse>> GetByIdAsync(Guid id)
        {
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

            return Result<ProjectResponse>.Success(project.ToResponse(skills));
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

            return Result<bool>.Success(true);
        }
    }
}