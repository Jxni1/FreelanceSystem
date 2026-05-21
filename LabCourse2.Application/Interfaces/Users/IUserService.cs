using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Users;
using Microsoft.AspNetCore.Http;

namespace LabCourse2.Application.Interfaces.Users
{
    public interface IUserService : ICurrentUserService
    {
        Task<UserProfileDto?> GetCurrentUserProfileAsync();
        Task<UserProfileDto?> GetUserByIdAsync(Guid userId);
        Task<Result<FileExportResultDto>> ExportUsersAsync(UserQueryParams query, string format);
        Task<Result<ImportResultDto>> ImportUsersAsync(IFormFile file, string format);
        Task<Result<UserProfileDto>> UpdateCurrentUserAsync(UpdateUserRequest request);
        Task<Result<List<string>>> UpdateFreelancerSkillsAsync(UpdateFreelancerSkillsRequest request);
        Task<Result<bool>> DeleteCurrentUserAsync(DeleteUserRequest request);

        Task<Result<PagedResult<UserListItemDto>>> GetAllUsersAsync(UserQueryParams query);
        Task<Result<PagedResult<UserListItemDto>>> GetReportableUsersAsync(UserQueryParams query);

        Task<Result<UserListItemDto>> AdminUpdateUserAsync(Guid userId, AdminUpdateUserRequest request);
        Task<Result<bool>> AdminDeleteUserAsync(Guid userId);

        Task<Result<UserListItemDto>> CreateUserByAdminAsync(CreateUserByAdminRequest request);
    }
}