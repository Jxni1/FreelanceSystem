using System.IdentityModel.Tokens.Jwt;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.API.Middleware
{

    public class ActiveUserMiddleware
    {
        private readonly RequestDelegate _next;

        public ActiveUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext db)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                             ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (Guid.TryParse(userIdStr, out var userId))
                {
                    var isActive = await db.Users
                        .Where(u => u.UserID == userId)
                        .Select(u => (bool?)u.Is_Active)
                        .FirstOrDefaultAsync();

                    if (isActive is null or false)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new
                        {
                            success = false,
                            isDeactivated = true,
                            errors = new[] { "This account has been deactivated or no longer exists." }
                        });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }

    public static class ActiveUserMiddlewareExtensions
    {
        public static IApplicationBuilder UseActiveUserCheck(this IApplicationBuilder app)
            => app.UseMiddleware<ActiveUserMiddleware>();
    }
}