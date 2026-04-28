using LabCourse2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ClientsController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all client profiles (Requires JWT)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllClients(CancellationToken cancellationToken)
        {
            var clients = await _db.ClientProfiles
                .Include(c => c.User)
                .Select(c => new
                {
                    c.ClientID,
                    ClientName = c.User.Name + " " + c.User.Surname,
                    c.User.Email,
                    c.Bio,
                    c.Industry,
                    c.Budget
                })
                .ToListAsync(cancellationToken);

            return Ok(clients);
        }

        /// <summary>
        /// Get the current user's client profile (Requires JWT)
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetMyClientProfile(CancellationToken cancellationToken)
        {
            // Try every possible claim name .NET might use for the user ID
            var userIdStr = User.FindFirstValue("sub")
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.NameId);

            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Cannot resolve user identity from token.", claims = User.Claims.Select(c => new { c.Type, c.Value }) });

            var client = await _db.ClientProfiles
                .Include(c => c.User)
                .Where(c => c.UserID == userId)
                .Select(c => new
                {
                    c.ClientID,
                    ClientName = c.User.Name + " " + c.User.Surname,
                    c.User.Email
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (client == null)
                return NotFound(new { message = "No client profile found for the current user.", userID = userId });

            return Ok(client);
        }
    }
}
