using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Constants;
using LabCourse2.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _env;
        private readonly LabCourse2.Infrastructure.Services.IAuthorizationService _authorizationService;

        public AuthController(
            IAuthService authService,
            IWebHostEnvironment env,
            LabCourse2.Infrastructure.Services.IAuthorizationService authorizationService)
        {
            _authService = authService;
            _env = env;
            _authorizationService = authorizationService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request, UserAgent, RemoteIp);
            if (!result.Success)
                return BadRequest(new { success = false, errors = result.Errors });

            SetRefreshTokenCookie(result.RefreshToken!);
            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }

        [HttpPost("register-admin")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAdminAsync(request, UserAgent, RemoteIp);
            if (!result.Success)
                return BadRequest(new { success = false, errors = result.Errors });

            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                userId = result.UserId
            });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request, UserAgent, RemoteIp);
            if (!result.Success)
                return Unauthorized(new { success = false, errors = result.Errors });

            SetRefreshTokenCookie(result.RefreshToken!);
            return Ok(new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { success = false, errors = new[] { "No refresh token provided." } });

            var result = await _authService.RefreshTokenAsync(refreshToken, UserAgent, RemoteIp);

            if (result.IsTheftDetected)
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { success = false, isTheftDetected = true });
            }

            if (!result.Success)
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { success = false, errors = result.Errors });
            }

            SetRefreshTokenCookie(result.RefreshToken!);
            return Ok(new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID in token" });

            var profile = await _authService.GetUserProfileAsync(userId);
            if (profile is null)
                return NotFound(new { message = "User not found" });

            return Ok(profile);
        }

        [HttpPost("revoke")]
        [AllowAnonymous]
        public async Task<IActionResult> Revoke()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            ClearRefreshTokenCookie();

            if (string.IsNullOrEmpty(refreshToken))
                return NoContent();

            await _authService.RevokeTokenAsync(refreshToken);
            return NoContent();
        }

        [HttpGet("my-permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID in token" });

            var roles = (await _authorizationService.GetUserRolesAsync(userId)).ToList();
            var permissions = (await _authorizationService.GetUserPermissionsAsync(userId)).ToList();

            return Ok(new
            {
                roles,
                permissions
            });
        }

        private void SetRefreshTokenCookie(string token)
        {
            var isDev = _env.IsDevelopment();
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = isDev ? SameSiteMode.None : SameSiteMode.Strict,
                Path = "/api/auth",
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
        }

        private void ClearRefreshTokenCookie()
        {
            var isDev = _env.IsDevelopment();
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/api/auth",
                Secure = true,
                SameSite = isDev ? SameSiteMode.None : SameSiteMode.Strict,
            });
        }

        private string? UserAgent =>
            Request.Headers.UserAgent.FirstOrDefault();

        private string? RemoteIp =>
            HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
