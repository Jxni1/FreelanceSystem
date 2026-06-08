using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    /// <summary>
    /// Service for managing user roles and permissions
    /// </summary>
    public interface IRoleManagementService
    {
        /// <summary>
        /// Assign a role to a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="roleId">The role ID to assign</param>
        /// <exception cref="InvalidOperationException">If user already has the role or if user/role doesn't exist</exception>
        Task AssignRoleToUserAsync(Guid userId, Guid roleId);

        /// <summary>
        /// Remove a role from a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="roleId">The role ID to remove</param>
        /// <exception cref="InvalidOperationException">If user doesn't have the role</exception>
        Task RemoveRoleFromUserAsync(Guid userId, Guid roleId);

        /// <summary>
        /// Get all users with a specific role
        /// </summary>
        /// <param name="roleId">The role ID</param>
        /// <returns>List of users with the role</returns>
        Task<IEnumerable<User>> GetUsersWithRoleAsync(Guid roleId);
    }

    public class RoleManagementService : IRoleManagementService
    {
        private readonly AppDbContext _context;

        public RoleManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            // Check if user already has this role
            var alreadyAssigned = await _context.UserRoles
                .AnyAsync(ur => ur.UserID == userId && ur.RoleID == roleId);

            if (alreadyAssigned)
                throw new InvalidOperationException("User already has this role");

            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserID == userId);
            if (!userExists)
                throw new InvalidOperationException("User not found");

            // Check if role exists
            var roleExists = await _context.Roles.AnyAsync(r => r.RoleID == roleId);
            if (!roleExists)
                throw new InvalidOperationException("Role not found");

            // Create the assignment
            var userRole = new UserRole
            {
                UserRolesID = Guid.NewGuid(),
                UserID = userId,
                RoleID = roleId,
                Assigned_At = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveRoleFromUserAsync(Guid userId, Guid roleId)
        {
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserID == userId && ur.RoleID == roleId);

            if (userRole == null)
                throw new InvalidOperationException("User doesn't have this role");

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetUsersWithRoleAsync(Guid roleId)
        {
            var users = await _context.UserRoles
                .Where(ur => ur.RoleID == roleId)
                .Select(ur => ur.User)
                .Distinct()
                .ToListAsync();

            return users;
        }
    }
}
