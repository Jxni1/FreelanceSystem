using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Interfaces
{
    public interface ITokenService
    {

        string GenerateAccessToken(User user, IEnumerable<string> roles, string profileType);

        string GenerateRefreshToken();
    }
}