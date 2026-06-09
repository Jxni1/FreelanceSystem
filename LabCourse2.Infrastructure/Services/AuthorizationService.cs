using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public interface IAuthorizationService
    {
        Task<bool> HasPermissionAsync(Guid userId, string permissionName);
        Task<bool> HasRoleAsync(Guid userId, string roleName);
        Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId);
        Task<IEnumerable<string>> GetUserRolesAsync(Guid userId);
    }

    public class AuthorizationService : IAuthorizationService
    {
        private readonly AppDbContext _dbContext;

        public AuthorizationService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permissionName)
        {
            return await _dbContext.UserRoles
                .Where(ur => ur.UserID == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .AnyAsync(rp => rp.Permission.Name == permissionName);
        }

        public async Task<bool> HasRoleAsync(Guid userId, string roleName)
        {
            return await _dbContext.UserRoles
                .Where(ur => ur.UserID == userId)
                .AnyAsync(ur => ur.Role.Name == roleName);
        }

        public async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId)
        {
            return await _dbContext.UserRoles
                .Where(ur => ur.UserID == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(Guid userId)
        {
            return await _dbContext.UserRoles
                .Where(ur => ur.UserID == userId)
                .Select(ur => ur.Role.Name)
                .ToListAsync();
        }
    }
}