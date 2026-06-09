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
                    new Permission { PermissionsID = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "projects.create", Description = "Can create projects" },
                    new Permission { PermissionsID = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "projects.delete", Description = "Can delete projects" },
                    new Permission { PermissionsID = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "proposals.submit", Description = "Can submit proposals" },
                    new Permission { PermissionsID = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "users.block", Description = "Can block users" }
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
                var clientRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Client);
                var freelancerRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Freelancer);

                if (adminRole != null && !await db.RolePermissions.AnyAsync(rp => rp.RoleID == adminRole.RoleID))
                {
                     
                    var adminPermissions = await db.Permissions.ToListAsync();
                    foreach (var perm in adminPermissions)
                    {
                        db.RolePermissions.Add(new RolePermission
                        {
                            RolePermissionsID = Guid.NewGuid(),
                            RoleID = adminRole.RoleID,
                            PermissionsID = perm.PermissionsID
                        });
                    }
                    logger.LogInformation("Seeded Admin role permissions");
                }

                if (clientRole != null && !await db.RolePermissions.AnyAsync(rp => rp.RoleID == clientRole.RoleID))
                {
                     
                    var projectCreatePerm = await db.Permissions.FirstAsync(p => p.Name == "projects.create");
                    db.RolePermissions.Add(new RolePermission
                    {
                        RolePermissionsID = Guid.NewGuid(),
                        RoleID = clientRole.RoleID,
                        PermissionsID = projectCreatePerm.PermissionsID
                    });
                    logger.LogInformation("Seeded Client role permissions");
                }

                if (freelancerRole != null && !await db.RolePermissions.AnyAsync(rp => rp.RoleID == freelancerRole.RoleID))
                {
                    
                    var proposalSubmitPerm = await db.Permissions.FirstAsync(p => p.Name == "proposals.submit");
                    db.RolePermissions.Add(new RolePermission
                    {
                        RolePermissionsID = Guid.NewGuid(),
                        RoleID = freelancerRole.RoleID,
                        PermissionsID = proposalSubmitPerm.PermissionsID
                    });
                    logger.LogInformation("Seeded Freelancer role permissions");
                }

                await db.SaveChangesAsync();

                var adminUser = await db.Roles.FirstAsync(r => r.Name == RoleConstants.Admin);
                bool adminExists = await db.UserRoles.AnyAsync(ur => ur.RoleID == adminUser.RoleID);

                if (!adminExists)
                {
                    var adminUserEntity = new User
                    {
                        UserID = Guid.NewGuid(),
                        Name = "System",
                        Surname = "Admin",
                        Username = "admin",
                        Email = "admin@freelancesystem.com",
                    };

                    db.Users.Add(adminUserEntity);
                    await db.SaveChangesAsync();

                    db.UserRoles.Add(new UserRole
                    {
                        UserRolesID = Guid.NewGuid(),
                        UserID = adminUserEntity.UserID,
                        RoleID = adminUser.RoleID
                    });
                    await db.SaveChangesAsync();
                    logger.LogInformation("Seeded admin user");
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