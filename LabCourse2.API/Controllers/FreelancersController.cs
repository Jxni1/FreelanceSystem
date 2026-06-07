using LabCourse2.Application.DTOs.Freelancers;
using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class FreelancersController : BaseApiController
    {
        private readonly IFreelancerService _freelancerService;

        public FreelancersController(IFreelancerService freelancerService)
        {
            _freelancerService = freelancerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FreelancerQueryParams query)
        {
            var result = await _freelancerService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _freelancerService.GetByIdAsync(id);
            return ToActionResult(result);
        }
    }
}
