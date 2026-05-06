using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Users;
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

        // -------- CURRENT USER --------

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

        public async Task<Result<UserProfileDto>> UpdateCurrentUserAsync(UpdateUserRequest request)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .FirstOrDefaultAsync(u => u.UserID == UserId && u.Is_Active);

            if (user is null)
                return Result<UserProfileDto>.NotFound("User not found.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.UserID != user.UserID &&
                u.Is_Active &&
                u.Username == request.Username);

            if (usernameExists)
                return Result<UserProfileDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.UserID != user.UserID &&
                u.Is_Active &&
                u.Email == request.Email);

            if (emailExists)
                return Result<UserProfileDto>.Failure("Email is already taken.");

            user.Name = request.Name;
            user.Surname = request.Surname;
            user.Username = request.Username;
            user.Email = request.Email;
            user.Profile_Photo = request.ProfilePhoto;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var dto = new UserProfileDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
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

            return Result<UserProfileDto>.Success(dto);
        }

        public async Task<Result<bool>> DeleteCurrentUserAsync(DeleteUserRequest request)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == UserId && u.Is_Active);

            if (user is null)
                return Result<bool>.NotFound("User not found.");

            if (string.IsNullOrWhiteSpace(request.Password))
                return Result<bool>.Failure("Password is required.");

            // Use same hashing as registration
            var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash);

            if (!passwordValid)
                return Result<bool>.Failure("Incorrect password.");

            user.Is_Active = false;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        // -------- ADMIN: LIST / UPDATE / DELETE --------

        public async Task<Result<PagedResult<UserListItemDto>>> GetAllUsersAsync(UserQueryParams query)
        {
            var q = _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                q = q.Where(u =>
                    u.Name.Contains(search) ||
                    u.Surname.Contains(search) ||
                    u.Username.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (query.IsActive.HasValue)
                q = q.Where(u => u.Is_Active == query.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(query.Role))
                q = q.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(u => u.Created_At)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => new UserListItemDto
                {
                    UserId = u.UserID,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    Email = u.Email,
                    IsActive = u.Is_Active,
                    CreatedAt = u.Created_At,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToListAsync();

            return Result<PagedResult<UserListItemDto>>.Success(new PagedResult<UserListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<UserListItemDto>> AdminUpdateUserAsync(Guid userId, AdminUpdateUserRequest request)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user is null)
                return Result<UserListItemDto>.Failure("User not found.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.UserID != userId &&
                u.Is_Active &&
                u.Username == request.Username);

            if (usernameExists)
                return Result<UserListItemDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.UserID != userId &&
                u.Is_Active &&
                u.Email == request.Email);

            if (emailExists)
                return Result<UserListItemDto>.Failure("Email is already taken.");

            user.Name = request.Name;
            user.Surname = request.Surname;
            user.Username = request.Username;
            user.Email = request.Email;
            user.Is_Active = request.IsActive;
            user.Updated_At = DateTime.UtcNow;

            var existingRoles = user.UserRoles.ToList();
            _db.UserRoles.RemoveRange(existingRoles);

            if (request.Roles.Any())
            {
                var roles = await _db.Roles
                    .Where(r => request.Roles.Contains(r.Name))
                    .ToListAsync();

                foreach (var role in roles)
                {
                    _db.UserRoles.Add(new Domain.Entities.UserRole
                    {
                        UserRolesID = Guid.NewGuid(),
                        UserID = user.UserID,
                        RoleID = role.RoleID,
                        Assigned_At = DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();

            var updatedUser = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstAsync(u => u.UserID == userId);

            return Result<UserListItemDto>.Success(new UserListItemDto
            {
                UserId = updatedUser.UserID,
                Name = updatedUser.Name,
                Surname = updatedUser.Surname,
                Username = updatedUser.Username,
                Email = updatedUser.Email,
                IsActive = updatedUser.Is_Active,
                CreatedAt = updatedUser.Created_At,
                Roles = updatedUser.UserRoles.Select(ur => ur.Role.Name).ToList()
            });
        }

        public async Task<Result<bool>> AdminDeleteUserAsync(Guid userId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == userId);

            if (user is null)
                return Result<bool>.Failure("User not found.");

            user.Is_Active = false;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        // -------- ADMIN: CREATE USER (WITH PROFILE) --------

        public async Task<Result<UserListItemDto>> CreateUserByAdminAsync(CreateUserByAdminRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword) ||
                string.IsNullOrWhiteSpace(request.Role))
            {
                return Result<UserListItemDto>.Failure("All required fields must be provided.");
            }

            if (request.Password != request.ConfirmPassword)
                return Result<UserListItemDto>.Failure("Passwords do not match.");

            if (request.Role != "Client" && request.Role != "Freelancer")
                return Result<UserListItemDto>.Failure("Invalid role.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.Username == request.Username && u.Is_Active);

            if (usernameExists)
                return Result<UserListItemDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.Email == request.Email && u.Is_Active);

            if (emailExists)
                return Result<UserListItemDto>.Failure("Email is already taken.");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);

            if (role is null)
                return Result<UserListItemDto>.Failure($"Role '{request.Role}' does not exist.");

            var user = new Domain.Entities.User
            {
                UserID = Guid.NewGuid(),
                Name = request.Name,
                Surname = request.Surname,
                Username = request.Username,
                Email = request.Email,
                Password_Hash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Is_Active = true,
                Created_At = DateTime.UtcNow,
                Updated_At = DateTime.UtcNow
            };

            _db.Users.Add(user);

            _db.UserRoles.Add(new Domain.Entities.UserRole
            {
                UserRolesID = Guid.NewGuid(),
                UserID = user.UserID,
                RoleID = role.RoleID,
                Assigned_At = DateTime.UtcNow
            });

            if (request.Role == "Client")
            {
                _db.ClientProfiles.Add(new Domain.Entities.ClientProfile
                {
                    ClientID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Bio = request.Bio ?? string.Empty,
                    Industry = request.Industry ?? string.Empty,
                    Budget = request.Budget ?? 0
                });
            }
            else if (request.Role == "Freelancer")
            {
                _db.FreelancerProfiles.Add(new Domain.Entities.FreelancerProfile
                {
                    FreelancerID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Experience_Level = request.ExperienceLevel ?? string.Empty,
                    Hourly_Rate = request.HourlyRate ?? 0
                });
            }

            await _db.SaveChangesAsync();

            return Result<UserListItemDto>.Success(new UserListItemDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.Is_Active,
                CreatedAt = user.Created_At,
                Roles = new List<string> { request.Role }
            });
        }
    }
}