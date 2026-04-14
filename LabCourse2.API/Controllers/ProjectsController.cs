using FluentValidation;
using LabCourse2.Application.DTOs.Common;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] //  JWT Authentication required for all endpoints
    public class ProjectsController : ControllerBase
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

        /// <summary>
        /// Get all projects (Requires JWT)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(Result<IEnumerable<ProjectResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<IEnumerable<ProjectResponse>>>> GetAllProjects(CancellationToken cancellationToken)
        {
            var result = await _projectService.GetAllAsync(cancellationToken);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get project by ID (Requires JWT)
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<ProjectResponse>>> GetProjectById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _projectService.GetByIdAsync(id, cancellationToken);
            
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Get projects by client ID (Requires JWT)
        /// </summary>
        [HttpGet("client/{clientId:guid}")]
        [ProducesResponseType(typeof(Result<IEnumerable<ProjectResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<IEnumerable<ProjectResponse>>>> GetProjectsByClientId(Guid clientId, CancellationToken cancellationToken)
        {
            var result = await _projectService.GetByClientIdAsync(clientId, cancellationToken);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get projects by category ID (Requires JWT)
        /// </summary>
        [HttpGet("category/{categoryId:guid}")]
        [ProducesResponseType(typeof(Result<IEnumerable<ProjectResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<IEnumerable<ProjectResponse>>>> GetProjectsByCategoryId(Guid categoryId, CancellationToken cancellationToken)
        {
            var result = await _projectService.GetByCategoryIdAsync(categoryId, cancellationToken);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Create a new project (Requires JWT)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<ProjectResponse>>> CreateProject([FromBody] CreateProjectRequest request, CancellationToken cancellationToken)
        {
            var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(Result<ProjectResponse>.FailureResult(errors));
            }

            var result = await _projectService.CreateAsync(request, cancellationToken);
            
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetProjectById), new { id = result.Data!.ProjectID }, result);
        }

        /// <summary>
        /// Update an existing project (Requires JWT)
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<ProjectResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<ProjectResponse>>> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request, CancellationToken cancellationToken)
        {
            var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(Result<ProjectResponse>.FailureResult(errors));
            }

            var result = await _projectService.UpdateAsync(id, request, cancellationToken);
            
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a project (Requires JWT)
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Result<bool>>> DeleteProject(Guid id, CancellationToken cancellationToken)
        {
            var result = await _projectService.DeleteAsync(id, cancellationToken);
            
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
