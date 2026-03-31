using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Register a new Freelancer or Client account.
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);

            if (!result.Success)
                return BadRequest(result);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Register a new Admin account. Requires an existing Admin JWT.
        /// </summary>
        [HttpPost("register-admin")]
        [Authorize(Roles = RoleConstants.Admin)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAdminAsync(request);

            if (!result.Success)
                return BadRequest(result);

            return StatusCode(StatusCodes.Status201Created, result);
        }
    }
}
