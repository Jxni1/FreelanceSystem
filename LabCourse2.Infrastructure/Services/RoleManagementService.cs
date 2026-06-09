using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public interface IRoleManagementService
    {
        Task AssignRoleToUserAsync(Guid userId, Guid roleId);
        Task RemoveRoleFromUserAsync(Guid userId, Guid roleId);
        Task<IEnumerable<User>> GetUsersWithRoleAsync(Guid roleId);
    }

    public class RoleManagementService : IRoleManagementService
    {
        private readonly AppDbContext _dbContext;

        public RoleManagementService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            var userRoleExists = await _dbContext.UserRoles
                .AnyAsync(ur => ur.UserID == userId && ur.RoleID == roleId);

            if (userRoleExists)
                throw new InvalidOperationException("User already has this role assigned.");

            var userRole = new UserRole
            {
                UserRolesID = Guid.NewGuid(),
                UserID = userId,
                RoleID = roleId
            };

            _dbContext.UserRoles.Add(userRole);
            await _dbContext.SaveChangesAsync();
        }

        public async Task RemoveRoleFromUserAsync(Guid userId, Guid roleId)
        {
            var userRole = await _dbContext.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserID == userId && ur.RoleID == roleId);

            if (userRole == null)
                throw new InvalidOperationException("User does not have this role assigned.");

            _dbContext.UserRoles.Remove(userRole);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetUsersWithRoleAsync(Guid roleId)
        {
            return await _dbContext.UserRoles
                .Where(ur => ur.RoleID == roleId)
                .Select(ur => ur.User)
                .ToListAsync();
        }
    }
}