using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
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
        private readonly ITokenService _tokenService;
        private readonly LabCourse2.Infrastructure.Services.IAuthorizationService _authorizationService;

        public AuthController(
            IAuthService authService,
            ITokenService tokenService,
            LabCourse2.Infrastructure.Services.IAuthorizationService authorizationService)
        {
            _authService = authService;
            _tokenService = tokenService;
            _authorizationService = authorizationService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
                return BadRequest(new { errors = result.Errors });
            return Ok(result);
        }

        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAdminAsync(request);
            if (!result.Success)
                return BadRequest(new { errors = result.Errors });
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success)
                return BadRequest(new { errors = result.Errors });
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                    return Unauthorized(new { message = "No refresh token found" });

                var result = await _authService.RefreshTokenAsync(refreshToken);
                if (!result.Success)
                    return Unauthorized(new { errors = result.Errors });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error refreshing token", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;

                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user ID in token" });
                }

                var result = await _authService.GetUserProfileAsync(userId);
                if (result == null)
                    return NotFound(new { message = "User not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving user", error = ex.Message });
            }
        }

        [HttpPost("revoke")]
        [Authorize]
        public async Task<IActionResult> Revoke()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                    return Unauthorized(new { message = "No refresh token found" });

                var result = await _authService.RevokeTokenAsync(refreshToken);
                if (!result.Success)
                    return BadRequest(new { errors = result.Errors });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error revoking token", error = ex.Message });
            }
        }

        [HttpGet("my-permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;

                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user ID in token" });
                }

                var roles = (await _authorizationService.GetUserRolesAsync(userId)).ToList();
                var permissions = (await _authorizationService.GetUserPermissionsAsync(userId)).ToList();

                return Ok(new
                {
                    roles,
                    permissions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving permissions", error = ex.Message });
            }
        }

        
        [HttpGet("debug/decode-token")]
        [Authorize]
        public IActionResult DecodeToken()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                    return BadRequest("No Bearer token found");

                var token = authHeader.Substring("Bearer ".Length);
                
                
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var claims = jwtToken.Claims.Select(c => new { c.Type, c.Value }).ToList();

                return Ok(new
                {
                    tokenExpiry = jwtToken.ValidTo,
                    claims = claims,
                    roleClaimsFound = jwtToken.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}