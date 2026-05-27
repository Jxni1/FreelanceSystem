using LabCourse2.Application.DTOs.AI;
using LabCourse2.Application.Interfaces.AI;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public class AIRecommendationService : IAIRecommendationService
    {
        private readonly AppDbContext _context;
        private readonly IAIMatchingPredictionService _predictionService;

        public AIRecommendationService(
            AppDbContext context,
            IAIMatchingPredictionService predictionService)
        {
            _context = context;
            _predictionService = predictionService;
        }

        public async Task<List<RecommendedProjectDto>> GetRecommendedProjectsAsync(Guid freelancerId)
        {
            var freelancer = await _context.FreelancerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FreelancerID == freelancerId);

            if (freelancer == null)
                throw new Exception("Freelancer not found.");

            var freelancerSkills = await _context.FreelancerSkills
                .AsNoTracking()
                .Include(fs => fs.Skill)
                .Where(fs => fs.FreelancerID == freelancerId)
                .ToListAsync();

            var projects = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Category)
                .Where(p => p.Status == "Open" && p.Visibility == "Public")
                .ToListAsync();

            var projectSkills = await _context.ProjectSkills
                .AsNoTracking()
                .Include(ps => ps.Skill)
                .ToListAsync();

            var contractedProjectIds = await _context.Contracts
                .AsNoTracking()
                .Where(c => c.FreelancerID == freelancerId)
                .Select(c => c.ProjectID)
                .ToListAsync();

            var fSkillNames = freelancerSkills
                .Select(x => x.Skill.Name)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var freelancerText =
                $"Experience level: {freelancer.Experience_Level}. " +
                $"Hourly rate: {freelancer.Hourly_Rate}. " +
                $"Skills: {string.Join(", ", fSkillNames)}. " +
                $"Skill levels: {string.Join(", ", freelancerSkills.Select(x => $"{x.Skill.Name}:{x.Level}"))}.";

            double MapLevel(string level) => level.Trim().ToLower() switch
            {
                "beginner" => 0.4,
                "intermediate" => 0.7,
                "advanced" => 1.0,
                "junior" => 0.4,
                "mid" => 0.7,
                "senior" => 1.0,
                _ => 0.5
            };

            var skillLevelScore = freelancerSkills.Count == 0
                ? 0
                : freelancerSkills.Average(x => MapLevel(x.Level));

            var results = new List<RecommendedProjectDto>();

            foreach (var project in projects)
            {
                if (contractedProjectIds.Contains(project.ProjectID))
                    continue;

                var pSkills = projectSkills
                    .Where(ps => ps.ProjectID == project.ProjectID)
                    .ToList();

                var pSkillNames = pSkills
                    .Select(x => x.Skill.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var overlapCount = pSkillNames.Count == 0
                    ? 0
                    : pSkillNames.Count(skill => fSkillNames.Contains(skill, StringComparer.OrdinalIgnoreCase));

                var skillOverlap = pSkillNames.Count == 0
                    ? 0
                    : (double)overlapCount / pSkillNames.Count;

                var projectText =
                    $"Title: {project.Title}. " +
                    $"Description: {project.Description}. " +
                    $"Category: {project.Category.Name}. " +
                    $"Budget: {project.Budget}. " +
                    $"Skills: {string.Join(", ", pSkillNames)}.";

                var categoryMatch = skillOverlap >= 0.5 ? 1 : 0;

                var budgetFit = project.Budget >= freelancer.Hourly_Rate * 10 ? 1.0 : 0.0;

                var request = new MatchPredictionRequest
                {
                    FreelancerText = freelancerText,
                    ProjectText = projectText,
                    ExperienceLevel = freelancer.Experience_Level,
                    HourlyRate = (double)freelancer.Hourly_Rate,
                    ProjectBudget = (double)project.Budget,
                    CategoryMatch = categoryMatch,
                    SkillOverlap = skillOverlap,
                    SkillLevelScore = skillLevelScore,
                    ProposalBidRatio = 0,
                    DeliveryDays = 0
                };

                var prediction = await _predictionService.PredictAsync(request);
                if (prediction == null)
                    continue;

                var hybridScore =
                    (prediction.MatchScore * 0.35) +
                    (skillOverlap * 100.0 * 0.50) +
                    (categoryMatch * 10.0) +
                    (budgetFit * 5.0);

                if (hybridScore > 100)
                    hybridScore = 100;

                results.Add(new RecommendedProjectDto
                {
                    ProjectId = project.ProjectID,
                    Title = project.Title,
                    Description = project.Description,
                    Budget = project.Budget,
                    CategoryName = project.Category.Name,
                    MatchScore = Math.Round(hybridScore, 2),
                    CosineSimilarity = Math.Round(skillOverlap, 4),
                    Prediction = prediction.Prediction
                });
            }

            return results
                .OrderByDescending(x => x.MatchScore)
                .ThenByDescending(x => x.CosineSimilarity)
                .ToList();
        }
    }
}