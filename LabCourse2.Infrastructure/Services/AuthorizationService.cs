using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    /// <summary>
    /// Service for checking user permissions and roles in the RBAC system
    /// </summary>
    public interface IAuthorizationService
    {
        /// <summary>
        /// Check if a user has a specific permission
        /// </summary>
        /// <param name="userId">The user ID to check</param>
        /// <param name="permissionName">The permission name (e.g., "projects.create")</param>
        /// <returns>True if user has the permission, false otherwise</returns>
        Task<bool> HasPermissionAsync(Guid userId, string permissionName);

        /// <summary>
        /// Check if a user has a specific role
        /// </summary>
        /// <param name="userId">The user ID to check</param>
        /// <param name="roleName">The role name (e.g., "Admin", "Client", "Freelancer")</param>
        /// <returns>True if user has the role, false otherwise</returns>
        Task<bool> HasRoleAsync(Guid userId, string roleName);

        /// <summary>
        /// Get all permissions a user has across all their roles
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>Collection of permission names</returns>
        Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId);

        /// <summary>
        /// Get all roles assigned to a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>Collection of role names</returns>
        Task<IEnumerable<string>> GetUserRolesAsync(Guid userId);
    }

    public class AuthorizationService : IAuthorizationService
    {
        private readonly AppDbContext _context;

        public AuthorizationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permissionName)
        {
            var hasPermission = await _context.UserRoles
                .Where(ur => ur.UserID == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .AnyAsync(rp => rp.Permission.Name == permissionName);

            return hasPermission;
        }

        public async Task<bool> HasRoleAsync(Guid userId, string roleName)
        {
            var hasRole = await _context.UserRoles
                .Where(ur => ur.UserID == userId)
                .AnyAsync(ur => ur.Role.Name == roleName);

            return hasRole;
        }

        public async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId)
        {
            var permissions = await _context.UserRoles
                .Where(ur => ur.UserID == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            return permissions;
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(Guid userId)
        {
            var roles = await _context.UserRoles
                .Where(ur => ur.UserID == userId)
                .Select(ur => ur.Role.Name)
                .Distinct()
                .ToListAsync();

            return roles;
        }
    }
}
