using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Constants;
using LabCourse2.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly LabCourse2.Infrastructure.Services.IAuthorizationService _authorizationService;
        private readonly IWebHostEnvironment _env;

        public AuthController(IAuthService authService, LabCourse2.Infrastructure.Services.IAuthorizationService authorizationService, IWebHostEnvironment env)
        {
            _authService = authService;
            _authorizationService = authorizationService;
            _env = env;
        }


        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request, UserAgent, RemoteIp);
            if (!result.Success) return BadRequest(result);

            SetRefreshTokenCookie(result.RefreshToken!);
            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }

        [HttpPost("register-admin")]
        [Authorize(Roles = RoleConstants.Admin)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAdminAsync(request, UserAgent, RemoteIp);
            if (!result.Success) return BadRequest(result);

            SetRefreshTokenCookie(result.RefreshToken!);
            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }


        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request, UserAgent, RemoteIp);
            if (!result.Success) return Unauthorized(new { success = false, errors = result.Errors });

            SetRefreshTokenCookie(result.RefreshToken!);
            return Ok(new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }


        [HttpPost("refresh")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["rt"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { success = false, errors = new[] { "No refresh token provided." } });

            var result = await _authService.RefreshTokenAsync(refreshToken, UserAgent, RemoteIp);

            if (result.IsTheftDetected)
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { success = false, isTheftDetected = true });
            }

            if (!result.Success)
                return Unauthorized(new { success = false, errors = result.Errors });

            SetRefreshTokenCookie(result.RefreshToken!);
            return Ok(new
            {
                success = true,
                accessToken = result.AccessToken
            });
        }


        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var profile = await _authService.GetUserProfileAsync(userId);
            
            if (profile is null)
                return NotFound(new { success = false, message = "User profile not found." });

            return Ok(profile);
        }

        [HttpGet("my-permissions")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userIdStr = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var permissions = await _authorizationService.GetUserPermissionsAsync(userId);
            var roles = await _authorizationService.GetUserRolesAsync(userId);

            return Ok(new
            {
                roles = roles,
                permissions = permissions
            });
        }

        [HttpPost("revoke")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Revoke()
        {
            var refreshToken = Request.Cookies["rt"];
            ClearRefreshTokenCookie();

            if (string.IsNullOrEmpty(refreshToken))
                return NoContent();

            await _authService.RevokeTokenAsync(refreshToken);
            return NoContent();
        }


        private void SetRefreshTokenCookie(string token)
        {

            var isDev = _env.IsDevelopment();
            Response.Cookies.Append("rt", token, new CookieOptions
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
            Response.Cookies.Delete("rt", new CookieOptions
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