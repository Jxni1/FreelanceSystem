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

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var result = await _userService.GetCurrentUserProfileAsync();
            if (result is null)
            {
                return NotFound(new { error = "User profile not found" });
            }

            return Ok(result);
        }

        [HttpPut("profile-photo")]
        public async Task<IActionResult> UpdateProfilePhoto([FromBody] UpdateProfilePhotoRequest request)
        {
            if (string.IsNullOrEmpty(request.ProfilePhoto))
            {
                return BadRequest(new { error = "Profile photo is required" });
            }

            var result = await _userService.UpdateProfilePhotoAsync(request.ProfilePhoto);
            return ToActionResult(result);
        }
    }

    public class UpdateProfilePhotoRequest
    {
        public string? ProfilePhoto { get; set; }
    }
}
