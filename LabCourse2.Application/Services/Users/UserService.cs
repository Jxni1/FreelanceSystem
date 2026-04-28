using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LabCourse2.Application.Services.User
{
    public class UserService : IUserService
    {
        private readonly IAppDbContext _db;
        private readonly ClaimsPrincipal? _user;

        public UserService(IAppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _user = httpContextAccessor.HttpContext?.User;
        }


        public Guid UserId
        {
            get
            {
                var claim = _user?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(claim, out var id)
                    ? id
                    : throw new UnauthorizedAccessException("User is not authenticated.");
            }
        }

        public string? Username => _user?.FindFirstValue(ClaimTypes.Name);
        public string? ProfileType => _user?.FindFirstValue("profileType");
        public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;


        public async Task<UserProfileDto?> GetCurrentUserProfileAsync() =>
            await GetUserByIdAsync(UserId);

        public async Task<UserProfileDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserID == userId && u.Is_Active);

            if (user is null) return null;

            return new UserProfileDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                ProfilePhoto = user.Profile_Photo,
                Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),

                FreelancerProfile = user.FreelancerProfile is null ? null : new FreelancerProfileDto
                {
                    ExperienceLevel = user.FreelancerProfile.Experience_Level,
                    HourlyRate = user.FreelancerProfile.Hourly_Rate
                },
                ClientProfile = user.ClientProfile is null ? null : new ClientProfileDto
                {
                    Bio = user.ClientProfile.Bio,
                    Industry = user.ClientProfile.Industry,
                    Budget = user.ClientProfile.Budget
                }
            };
        }

        public async Task<Result<bool>> UpdateProfilePhotoAsync(string base64Photo)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == UserId && u.Is_Active);
                if (user is null)
                    return Result<bool>.Failure("User not found");

                user.Profile_Photo = base64Photo;
                _db.Users.Update(user);
                await _db.SaveChangesAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error updating profile photo: {ex.Message}");
            }
        }
    }
}