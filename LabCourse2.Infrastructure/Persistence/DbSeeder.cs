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

                var permissions = new[]
                {
                    new Permission { PermissionsID = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "projects.create", Description = "Create projects" },
                    new Permission { PermissionsID = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "projects.update", Description = "Update projects" },
                    new Permission { PermissionsID = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "projects.delete", Description = "Delete projects" },
                    new Permission { PermissionsID = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "proposals.submit", Description = "Submit proposals" },
                    new Permission { PermissionsID = Guid.Parse("66666666-6666-6666-6666-666666666666"), Name = "proposals.review", Description = "Accept or reject proposals" },
                    new Permission { PermissionsID = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), Name = "users.manage", Description = "Manage users" },
                    new Permission { PermissionsID = Guid.Parse("77777777-7777-7777-7777-777777777777"), Name = "categories.manage", Description = "Manage categories" },
                    new Permission { PermissionsID = Guid.Parse("88888888-8888-8888-8888-888888888888"), Name = "skills.manage", Description = "Manage skills" },
                    new Permission { PermissionsID = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "settings.manage", Description = "Manage platform settings" },
                    new Permission { PermissionsID = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Name = "contracts.manage", Description = "Manage all contracts" },
                    new Permission { PermissionsID = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), Name = "reports.moderate", Description = "Moderate reports" },
                    new Permission { PermissionsID = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), Name = "auditlogs.view", Description = "View audit logs" },
                    new Permission { PermissionsID = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), Name = "protectedviews.manage", Description = "Manage protected views" }
                };

                foreach (var permission in permissions)
                {
                    if (!await db.Permissions.AnyAsync(p => p.Name == permission.Name))
                    {
                        db.Permissions.Add(permission);
                        logger.LogInformation("Seeded permission: {Permission}", permission.Name);
                    }
                }

                await db.SaveChangesAsync();

                var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Admin);

                async Task GrantPermissionsAsync(string roleName, params string[] permissionNames)
                {
                    var roles = await db.Roles.Where(r => r.Name == roleName).ToListAsync();

                    foreach (var role in roles)
                    {
                        foreach (var name in permissionNames)
                        {
                            var permission = await db.Permissions.FirstOrDefaultAsync(p => p.Name == name);
                            if (permission is null) continue;

                            var alreadyGranted = await db.RolePermissions
                                .AnyAsync(rp => rp.RoleID == role.RoleID && rp.PermissionsID == permission.PermissionsID);

                            if (!alreadyGranted)
                            {
                                db.RolePermissions.Add(new RolePermission
                                {
                                    RolePermissionsID = Guid.NewGuid(),
                                    RoleID = role.RoleID,
                                    PermissionsID = permission.PermissionsID
                                });
                            }
                        }
                    }
                }

                await GrantPermissionsAsync(RoleConstants.Admin, permissions.Select(p => p.Name).ToArray());
                await GrantPermissionsAsync(RoleConstants.Client, "projects.create", "projects.update", "projects.delete", "proposals.review");
                await GrantPermissionsAsync(RoleConstants.Freelancer, "proposals.submit");

                await db.SaveChangesAsync();

                if (adminRole != null)
                {
                    var adminUserEntity = await db.Users
                        .FirstOrDefaultAsync(u => u.Email == "admin@freelancesystem.com");

                    if (adminUserEntity is null)
                    {
                        adminUserEntity = new User
                        {
                            UserID = Guid.NewGuid(),
                            Name = "System",
                            Surname = "Admin",
                            Username = "admin",
                            Email = "admin@freelancesystem.com",
                            Password_Hash = BCrypt.Net.BCrypt.HashPassword("Admin@123!"),
                            Is_Active = true,
                            Created_At = DateTime.UtcNow,
                            Updated_At = DateTime.UtcNow,
                        };
                        db.Users.Add(adminUserEntity);
                        logger.LogInformation("Seeded admin user");
                    }
                    else
                    {
                        if (string.IsNullOrEmpty(adminUserEntity.Password_Hash))
                        {
                            adminUserEntity.Password_Hash = BCrypt.Net.BCrypt.HashPassword("Admin@123!");
                            adminUserEntity.Updated_At = DateTime.UtcNow;
                            logger.LogInformation("Repaired admin user password");
                        }
                        adminUserEntity.Is_Active = true;
                    }

                    await db.SaveChangesAsync();

                    var hasAdminRole = await db.UserRoles
                        .AnyAsync(ur => ur.UserID == adminUserEntity.UserID && ur.RoleID == adminRole.RoleID);

                    if (!hasAdminRole)
                    {
                        db.UserRoles.Add(new UserRole
                        {
                            UserRolesID = Guid.NewGuid(),
                            UserID = adminUserEntity.UserID,
                            RoleID = adminRole.RoleID
                        });
                        await db.SaveChangesAsync();
                    }
                }

                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }
    }
}
