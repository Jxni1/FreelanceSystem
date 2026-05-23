using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.ProtectedViews;
using LabCourse2.Application.Interfaces.ProtectedViews;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.ProtectedViews
{
    public class ProtectedViewService : IProtectedViewService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public ProtectedViewService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Result<bool>> LogViewAsync(Guid projectId)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<bool>.Unauthorized("Authentication required.");

            var projectExists = await _context.Projects.AnyAsync(p => p.ProjectID == projectId);
            if (!projectExists)
                return Result<bool>.NotFound("Project not found.");

            var userId = _currentUser.UserId;
            var cutoff = DateTime.UtcNow.AddMinutes(-30);

            var alreadyLogged = await _context.Protected_Views
                .AnyAsync(v => v.ProjectID == projectId && v.UserID == userId && v.Viewed_at >= cutoff);

            if (!alreadyLogged)
            {
                var view = new Protected_Views
                {
                    Protected_ViewsID = Guid.NewGuid(),
                    Viewed_at = DateTime.UtcNow,
                    Created_by = _currentUser.Username ?? userId.ToString(),
                    Updated_at = DateTime.UtcNow,
                    Updated_by = _currentUser.Username ?? userId.ToString(),
                    ProjectID = projectId,
                    UserID = userId
                };

                await _context.Protected_Views.AddAsync(view);
                await _context.SaveChangesAsync();
            }

            return Result<bool>.Success(true);
        }

        public async Task<Result<PagedResult<ProtectedViewResponse>>> GetProjectViewsAsync(Guid projectId, ProtectedViewQueryParams query)
        {
            var project = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.ProjectID == projectId);
            if (project is null)
                return Result<PagedResult<ProtectedViewResponse>>.NotFound("Project not found.");

            if (!await CanAccessProjectAsync(project))
                return Result<PagedResult<ProtectedViewResponse>>.Forbidden("Access denied.");

            var totalCount = await _context.Protected_Views.CountAsync(v => v.ProjectID == projectId);

            var items = await _context.Protected_Views
                .AsNoTracking()
                .Where(v => v.ProjectID == projectId)
                .OrderByDescending(v => v.Viewed_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(v => new ProtectedViewResponse
                {
                    ProtectedViewID = v.Protected_ViewsID,
                    ViewedAt = v.Viewed_at,
                    ProjectID = v.ProjectID,
                    ProjectTitle = project.Title,
                    UserID = v.UserID,
                    Username = v.User != null ? v.User.Username : v.Created_by
                })
                .ToListAsync();

            return Result<PagedResult<ProtectedViewResponse>>.Success(new PagedResult<ProtectedViewResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ProjectViewStatsResponse>> GetProjectStatsAsync(Guid projectId)
        {
            var project = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.ProjectID == projectId);
            if (project is null)
                return Result<ProjectViewStatsResponse>.NotFound("Project not found.");

            if (!await CanAccessProjectAsync(project))
                return Result<ProjectViewStatsResponse>.Forbidden("Access denied.");

            var totalViews = await _context.Protected_Views.CountAsync(v => v.ProjectID == projectId);
            var uniqueViewers = await _context.Protected_Views
                .Where(v => v.ProjectID == projectId)
                .Select(v => v.UserID)
                .Distinct()
                .CountAsync();

            return Result<ProjectViewStatsResponse>.Success(new ProjectViewStatsResponse
            {
                ProjectID = projectId,
                ProjectTitle = project.Title,
                TotalViews = totalViews,
                UniqueViewers = uniqueViewers
            });
        }

        public async Task<Result<PagedResult<ProjectViewStatsResponse>>> GetMostViewedProjectsAsync(int page, int pageSize)
        {
            var grouped = await _context.Protected_Views
                .AsNoTracking()
                .GroupBy(v => v.ProjectID)
                .Select(g => new
                {
                    ProjectID = g.Key,
                    TotalViews = g.Count(),
                    UniqueViewers = g.Select(v => v.UserID).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalViews)
                .ToListAsync();

            var totalCount = grouped.Count;
            var pageItems = grouped.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var projectIds = pageItems.Select(x => x.ProjectID).ToList();
            var projectTitles = await _context.Projects
                .AsNoTracking()
                .Where(p => projectIds.Contains(p.ProjectID))
                .ToDictionaryAsync(p => p.ProjectID, p => p.Title);

            var items = pageItems.Select(x => new ProjectViewStatsResponse
            {
                ProjectID = x.ProjectID,
                ProjectTitle = projectTitles.TryGetValue(x.ProjectID, out var t) ? t : "Unknown",
                TotalViews = x.TotalViews,
                UniqueViewers = x.UniqueViewers
            }).ToList();

            return Result<PagedResult<ProjectViewStatsResponse>>.Success(new PagedResult<ProjectViewStatsResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task<Result<PagedResult<SuspiciousActivityResponse>>> GetSuspiciousActivityAsync(ProtectedViewQueryParams query)
        {
            var since = DateTime.UtcNow.AddHours(-24);
            const int threshold = 50;

            var suspicious = await _context.Protected_Views
                .AsNoTracking()
                .Where(v => v.Viewed_at >= since)
                .GroupBy(v => v.UserID)
                .Where(g => g.Count() >= threshold)
                .Select(g => new
                {
                    UserID = g.Key,
                    ViewCount = g.Count(),
                    PeriodStart = g.Min(v => v.Viewed_at),
                    PeriodEnd = g.Max(v => v.Viewed_at)
                })
                .OrderByDescending(x => x.ViewCount)
                .ToListAsync();

            var totalCount = suspicious.Count;
            var pageItems = suspicious.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();

            var userIds = pageItems.Select(x => x.UserID).ToList();
            var usernames = await _context.Users
                .AsNoTracking()
                .Where(u => userIds.Contains(u.UserID))
                .ToDictionaryAsync(u => u.UserID, u => u.Username);

            var items = pageItems.Select(x => new SuspiciousActivityResponse
            {
                UserID = x.UserID,
                Username = usernames.TryGetValue(x.UserID, out var name) ? name : "Unknown",
                ViewCount = x.ViewCount,
                PeriodStart = x.PeriodStart,
                PeriodEnd = x.PeriodEnd
            }).ToList();

            return Result<PagedResult<SuspiciousActivityResponse>>.Success(new PagedResult<SuspiciousActivityResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        private async Task<bool> CanAccessProjectAsync(Domain.Entities.Project project)
        {
            if (_currentUser.IsAdmin) return true;
            var clientProfile = await _context.ClientProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);
            return clientProfile is not null && clientProfile.ClientID == project.ClientID;
        }
    }
}