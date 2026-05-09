using LabCourse2.Application.DTOs.Users;
using LabCourse2.Domain.Entities;
using System.Linq;

namespace LabCourse2.Application.Mappings
{
    public static class UserMappingExtensions
    {
        public static UserResponse ToResponse(this User user) =>
            new()
            {
                UserID = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.Is_Active,
                CreatedAt = user.Created_At,
                UpdatedAt = user.Updated_At,
                ProfilePhoto = user.Profile_Photo,
                Roles = user.UserRoles?
                    .Select(ur => ur.Role.Name)
                    .ToList() ?? new List<string>()
            };

        public static void ApplyUpdate(this User user, UpdateUserRequest request)
        {
            user.Name = request.Name;
            user.Surname = request.Surname;
            user.Username = request.Username;
            user.Email = request.Email;
            user.Profile_Photo = request.ProfilePhoto;
            user.Updated_At = DateTime.UtcNow;
        }
    }
}