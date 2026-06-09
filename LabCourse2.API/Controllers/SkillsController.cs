using FluentValidation;
using LabCourse2.Application.DTOs.Skills;
using LabCourse2.Application.Interfaces.Skills;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class SkillsController : BaseApiController
    {
        private readonly ISkillService _skillService;
        private readonly IValidator<CreateSkillRequest> _createValidator;
        private readonly IValidator<UpdateSkillRequest> _updateValidator;

        public SkillsController(
            ISkillService skillService,
            IValidator<CreateSkillRequest> createValidator,
            IValidator<UpdateSkillRequest> updateValidator)
        {
            _skillService = skillService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] SkillQueryParams query)
        {
            var result = await _skillService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _skillService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateSkillRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _skillService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSkillRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _skillService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _skillService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}