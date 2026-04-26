using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;

namespace LabCourse2.Application.Interfaces.Users
{
    public interface IUserService : ICurrentUserService
    {
        Task<UserProfileDto?> GetCurrentUserProfileAsync();
        Task<UserProfileDto?> GetUserByIdAsync(Guid userId);
    }
}