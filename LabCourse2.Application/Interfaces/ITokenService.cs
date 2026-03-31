using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user, string role);
        string GenerateRefreshToken();
    }
}
