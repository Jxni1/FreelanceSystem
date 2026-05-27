using LabCourse2.Application.Interfaces.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/ai-recommendations")]
    //[Authorize]
    public class AIRecommendationController : ControllerBase
    {
        private readonly IAIRecommendationService _recommendationService;

        public AIRecommendationController(IAIRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpGet("{freelancerId:guid}")]
        public async Task<IActionResult> GetRecommendations(Guid freelancerId)
        {
            var result = await _recommendationService.GetRecommendedProjectsAsync(freelancerId);
            return Ok(result);
        }
    }
}