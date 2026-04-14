using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Interfaces
{
    public interface IProjectRepository
    {
        Task<Project?> GetByIdAsync(Guid projectId, CancellationToken cancellationToken = default);
        Task<Project?> GetByIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Project>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Project>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Project>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
        Task<Project> CreateAsync(Project project, CancellationToken cancellationToken = default);
        Task<Project> UpdateAsync(Project project, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid projectId, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Guid projectId, CancellationToken cancellationToken = default);
    }
}
