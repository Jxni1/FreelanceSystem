using System.Text.Json;
using AutoMapper;
using LabCourse2.Application.DTOs.Common;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace LabCourse2.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IMapper _mapper;
        private readonly IDistributedCache _cache;
        private readonly ILogger<ProjectService> _logger;
        private const string CacheKeyPrefix = "project:";
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(30);

        public ProjectService(
            IProjectRepository projectRepository,
            IMapper mapper,
            IDistributedCache cache,
            ILogger<ProjectService> logger)
        {
            _projectRepository = projectRepository;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        // Silently ignore cache failures so Redis being down never breaks DB operations
        private async Task<string?> TryGetCacheAsync(string key, CancellationToken ct)
        {
            try { return await _cache.GetStringAsync(key, ct); }
            catch (Exception ex) { _logger.LogWarning("Cache GET failed for {Key}: {Msg}", key, ex.Message); return null; }
        }

        private async Task TrySetCacheAsync(string key, string value, DistributedCacheEntryOptions opts, CancellationToken ct)
        {
            try { await _cache.SetStringAsync(key, value, opts, ct); }
            catch (Exception ex) { _logger.LogWarning("Cache SET failed for {Key}: {Msg}", key, ex.Message); }
        }

        private async Task TryRemoveCacheAsync(string key, CancellationToken ct)
        {
            try { await _cache.RemoveAsync(key, ct); }
            catch (Exception ex) { _logger.LogWarning("Cache REMOVE failed for {Key}: {Msg}", key, ex.Message); }
        }

        public async Task<Result<ProjectResponse>> GetByIdAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            try
            {
                var cacheKey = $"{CacheKeyPrefix}{projectId}";
                var cachedProject = await TryGetCacheAsync(cacheKey, cancellationToken);

                if (!string.IsNullOrEmpty(cachedProject))
                {
                    var cachedResponse = JsonSerializer.Deserialize<ProjectResponse>(cachedProject);
                    if (cachedResponse != null)
                        return Result<ProjectResponse>.SuccessResult(cachedResponse);
                }

                var project = await _projectRepository.GetByIdWithDetailsAsync(projectId, cancellationToken);
                if (project == null)
                    return Result<ProjectResponse>.FailureResult("Project not found");

                var response = _mapper.Map<ProjectResponse>(project);

                var cacheOptions = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = CacheExpiration
                };
                await TrySetCacheAsync(cacheKey, JsonSerializer.Serialize(response), cacheOptions, cancellationToken);

                return Result<ProjectResponse>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<ProjectResponse>.FailureResult($"Error retrieving project: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ProjectResponse>>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var projects = await _projectRepository.GetAllAsync(cancellationToken);
                var response = _mapper.Map<IEnumerable<ProjectResponse>>(projects);
                return Result<IEnumerable<ProjectResponse>>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ProjectResponse>>.FailureResult($"Error retrieving projects: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ProjectResponse>>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
        {
            try
            {
                var projects = await _projectRepository.GetByClientIdAsync(clientId, cancellationToken);
                var response = _mapper.Map<IEnumerable<ProjectResponse>>(projects);
                return Result<IEnumerable<ProjectResponse>>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ProjectResponse>>.FailureResult($"Error retrieving client projects: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ProjectResponse>>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
        {
            try
            {
                var projects = await _projectRepository.GetByCategoryIdAsync(categoryId, cancellationToken);
                var response = _mapper.Map<IEnumerable<ProjectResponse>>(projects);
                return Result<IEnumerable<ProjectResponse>>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ProjectResponse>>.FailureResult($"Error retrieving category projects: {ex.Message}");
            }
        }

        public async Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var project = _mapper.Map<Project>(request);
                project.ProjectID = Guid.NewGuid();

                var createdProject = await _projectRepository.CreateAsync(project, cancellationToken);
                var projectWithDetails = await _projectRepository.GetByIdWithDetailsAsync(createdProject.ProjectID, cancellationToken);
                var response = _mapper.Map<ProjectResponse>(projectWithDetails);

                return Result<ProjectResponse>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<ProjectResponse>.FailureResult($"Error creating project: {ex.Message}");
            }
        }

        public async Task<Result<ProjectResponse>> UpdateAsync(Guid projectId, UpdateProjectRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var existingProject = await _projectRepository.GetByIdAsync(projectId, cancellationToken);
                if (existingProject == null)
                    return Result<ProjectResponse>.FailureResult("Project not found");

                if (!string.IsNullOrEmpty(request.Title))
                    existingProject.Title = request.Title;

                if (!string.IsNullOrEmpty(request.Description))
                    existingProject.Description = request.Description;

                if (request.Budget.HasValue)
                    existingProject.Budget = request.Budget.Value;

                if (request.CategoryID.HasValue)
                    existingProject.CategoryID = request.CategoryID.Value;

                if (!string.IsNullOrEmpty(request.Visibility))
                    existingProject.Visibility = request.Visibility;

                if (!string.IsNullOrEmpty(request.Status))
                    existingProject.Status = request.Status;

                var updatedProject = await _projectRepository.UpdateAsync(existingProject, cancellationToken);

                await TryRemoveCacheAsync($"{CacheKeyPrefix}{projectId}", cancellationToken);

                var projectWithDetails = await _projectRepository.GetByIdWithDetailsAsync(updatedProject.ProjectID, cancellationToken);
                var response = _mapper.Map<ProjectResponse>(projectWithDetails);

                return Result<ProjectResponse>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                return Result<ProjectResponse>.FailureResult($"Error updating project: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(Guid projectId, CancellationToken cancellationToken = default)
        {
            try
            {
                var deleted = await _projectRepository.DeleteAsync(projectId, cancellationToken);
                if (!deleted)
                    return Result<bool>.FailureResult("Project not found");

                await TryRemoveCacheAsync($"{CacheKeyPrefix}{projectId}", cancellationToken);

                return Result<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.FailureResult($"Error deleting project: {ex.Message}");
            }
        }
    }
}
