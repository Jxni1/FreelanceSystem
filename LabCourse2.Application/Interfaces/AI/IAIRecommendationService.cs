using LabCourse2.Application.DTOs.AI;

namespace LabCourse2.Application.Interfaces.AI
{
    public interface IAIRecommendationService
    {
        Task<List<RecommendedProjectDto>> GetRecommendedProjectsAsync(Guid freelancerId);
    }
}