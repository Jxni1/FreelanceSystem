using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class ProjectMappingExtensions
    {
        public static ProjectResponse ToResponse(this Project project, List<string>? skills = null) =>
            new()
            {
                ProjectID = project.ProjectID,
                Title = project.Title,
                Description = project.Description,
                Budget = project.Budget,
                Status = project.Status,
                Visibility = project.Visibility,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                ClientID = project.ClientID,
                ClientName = project.Client?.User != null
                    ? $"{project.Client.User.Name} {project.Client.User.Surname}".Trim()
                    : string.Empty,
                CategoryID = project.CategoryID,
                CategoryName = project.Category?.Name ?? string.Empty,
                Skills = skills ?? new List<string>()
            };

        public static Project ToEntity(this CreateProjectRequest request, Guid clientId) =>
            new()
            {
                ProjectID = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Budget = request.Budget,
                Visibility = request.Visibility,
                Status = ProjectStatus.Open,
                CategoryID = request.CategoryID,
                ClientID = clientId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

        public static void ApplyUpdate(this Project project, UpdateProjectRequest request)
        {
            project.Title = request.Title;
            project.Description = request.Description;
            project.Budget = request.Budget;
            project.Status = request.Status;
            project.Visibility = request.Visibility;
            project.CategoryID = request.CategoryID;
            project.UpdatedAt = DateTime.UtcNow;
        }
    }
}