using FluentValidation;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces.Projects;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ProjectsController : BaseApiController
    {
        private readonly IProjectService _projectService;
        private readonly IValidator<CreateProjectRequest> _createValidator;
        private readonly IValidator<UpdateProjectRequest> _updateValidator;

        public ProjectsController(
            IProjectService projectService,
            IValidator<CreateProjectRequest> createValidator,
            IValidator<UpdateProjectRequest> updateValidator)
        {
            _projectService = projectService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        [AllowAnonymous]   
        public async Task<IActionResult> GetAll([FromQuery] ProjectQueryParams query)
        {
            var result = await _projectService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _projectService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _projectService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _projectService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _projectService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}