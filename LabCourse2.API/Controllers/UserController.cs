using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Users;
using LabCourse2.Application.Interfaces.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var result = await _userService.GetCurrentUserProfileAsync();

            if (result is null)
                return NotFound("Current user profile was not found.");

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);

            if (result is null)
                return NotFound($"User with ID {id} was not found.");

            return Ok(result);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            var result = await _userService.UpdateCurrentUserAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("me/skills")]
        public async Task<IActionResult> UpdateMySkills([FromBody] UpdateFreelancerSkillsRequest request)
        {
            var result = await _userService.UpdateFreelancerSkillsAsync(request);
            return ToActionResult(result);
        }

        [HttpDelete("me")]
        public async Task<IActionResult> DeleteCurrentUser([FromBody] DeleteUserRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Password is required.");

            var result = await _userService.DeleteCurrentUserAsync(request);
            return ToActionResult(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserQueryParams query)
        {
            var result = await _userService.GetAllUsersAsync(query);
            return ToActionResult(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserByAdminRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            var result = await _userService.CreateUserByAdminAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] AdminUpdateUserRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            var result = await _userService.AdminUpdateUserAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _userService.AdminDeleteUserAsync(id);
            return ToActionResult(result);
        }
    }
}