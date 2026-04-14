using LabCourse2.Application.DTOs.Common;
using LabCourse2.Application.DTOs.Projects;

namespace LabCourse2.Application.Interfaces
{
    public interface IProjectService
    {
        Task<Result<ProjectResponse>> GetByIdAsync(Guid projectId, CancellationToken cancellationToken = default);
        Task<Result<IEnumerable<ProjectResponse>>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Result<IEnumerable<ProjectResponse>>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default);
        Task<Result<IEnumerable<ProjectResponse>>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
        Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default);
        Task<Result<ProjectResponse>> UpdateAsync(Guid projectId, UpdateProjectRequest request, CancellationToken cancellationToken = default);
        Task<Result<bool>> DeleteAsync(Guid projectId, CancellationToken cancellationToken = default);
    }
}
