using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class FavoriteFreelancersController : BaseApiController
    {
        private readonly IFavoriteFreelancerService _favoriteFreelancerService;

        public FavoriteFreelancersController(IFavoriteFreelancerService favoriteFreelancerService)
        {
            _favoriteFreelancerService = favoriteFreelancerService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMine()
        {
            var result = await _favoriteFreelancerService.GetMineAsync();
            return ToActionResult(result);
        }

        [HttpPost("{freelancerId:guid}")]
        public async Task<IActionResult> Add(Guid freelancerId)
        {
            var result = await _favoriteFreelancerService.AddAsync(freelancerId);
            return ToActionResult(result);
        }

        [HttpDelete("{freelancerId:guid}")]
        public async Task<IActionResult> Remove(Guid freelancerId)
        {
            var result = await _favoriteFreelancerService.RemoveAsync(freelancerId);
            return ToActionResult(result);
        }
    }
}