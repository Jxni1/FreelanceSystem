using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Projects;

namespace LabCourse2.Application.Interfaces.Projects
{
    public interface IProjectService
    {
        Task<Result<PagedResult<ProjectResponse>>> GetAllAsync(ProjectQueryParams query);
        Task<Result<PagedResult<ProjectResponse>>> GetMyProjectsAsync(ProjectQueryParams query);
        Task<Result<ProjectResponse>> GetByIdAsync(Guid id);
        Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request);
        Task<Result<ProjectResponse>> UpdateAsync(Guid id, UpdateProjectRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}