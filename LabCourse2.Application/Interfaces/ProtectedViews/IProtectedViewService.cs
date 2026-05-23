using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.ProtectedViews;

namespace LabCourse2.Application.Interfaces.ProtectedViews
{
    public interface IProtectedViewService
    {
        Task<Result<bool>> LogViewAsync(Guid projectId);
        Task<Result<PagedResult<ProtectedViewResponse>>> GetProjectViewsAsync(Guid projectId, ProtectedViewQueryParams query);
        Task<Result<ProjectViewStatsResponse>> GetProjectStatsAsync(Guid projectId);
        Task<Result<PagedResult<ProjectViewStatsResponse>>> GetMostViewedProjectsAsync(int page, int pageSize);
        Task<Result<PagedResult<SuspiciousActivityResponse>>> GetSuspiciousActivityAsync(ProtectedViewQueryParams query);
    }
}