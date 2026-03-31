using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LabCourse2.Infrastructure.Persistence
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

            try
            {
                await db.Database.MigrateAsync();

                foreach (var roleName in RoleConstants.AllRoles)
                {
                    if (!await db.Roles.AnyAsync(r => r.Name == roleName))
                    {
                        db.Roles.Add(new Role
                        {
                            RoleID = Guid.NewGuid(),
                            Name = roleName,
                            Description = $"{roleName} role",
                            Created_At = DateTime.UtcNow
                        });
                        logger.LogInformation("Seeded role: {Role}", roleName);
                    }
                }

                await db.SaveChangesAsync();

                var adminRole = await db.Roles.FirstAsync(r => r.Name == RoleConstants.Admin);
                bool adminExists = await db.UserRoles.AnyAsync(ur => ur.RoleID == adminRole.RoleID);

                if (!adminExists)
                {
                    var adminUser = new User
                    {
                        UserID = Guid.NewGuid(),
                        Name = "System",
                        Surname = "Admin",
                        Username = "admin",
                        Email = "admin@freelancesystem.com",
                        Password_Hash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                        Is_Active = true,
                        Created_At = DateTime.UtcNow,
                        Updated_At = DateTime.UtcNow
                    };

                    db.Users.Add(adminUser);

                    db.UserRoles.Add(new UserRole
                    {
                        UserRolesID = Guid.NewGuid(),
                        UserID = adminUser.UserID,
                        RoleID = adminRole.RoleID,
                        Assigned_At = DateTime.UtcNow
                    });

                    await db.SaveChangesAsync();
                    logger.LogWarning(
                        "Seeded default admin user (admin@freelancesystem.com).");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }
    }
}
