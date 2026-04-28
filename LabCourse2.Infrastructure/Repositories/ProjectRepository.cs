using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetByIdAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProjectID == projectId, cancellationToken);
        }

        public async Task<Project?> GetByIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .Include(p => p.Client)
                    .ThenInclude(c => c.User)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProjectID == projectId, cancellationToken);
        }

        public async Task<IEnumerable<Project>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .Include(p => p.Client)
                    .ThenInclude(c => c.User)
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Project>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .Include(p => p.Category)
                .Where(p => p.ClientID == clientId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Project>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .Include(p => p.Client)
                    .ThenInclude(c => c.User)
                .Where(p => p.CategoryID == categoryId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<Project> CreateAsync(Project project, CancellationToken cancellationToken = default)
        {
            await _context.Projects.AddAsync(project, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return project;
        }

        public async Task<Project> UpdateAsync(Project project, CancellationToken cancellationToken = default)
        {
            _context.Projects.Update(project);
            await _context.SaveChangesAsync(cancellationToken);
            return project;
        }

        public async Task<bool> DeleteAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            var project = await _context.Projects.FindAsync([projectId], cancellationToken);
            if (project == null)
                return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> ExistsAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .AnyAsync(p => p.ProjectID == projectId, cancellationToken);
        }
    }
}
