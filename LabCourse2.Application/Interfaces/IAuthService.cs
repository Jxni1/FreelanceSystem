using LabCourse2.Application.DTOs.Auth;

namespace LabCourse2.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request);
        Task<AuthResult> RegisterAdminAsync(RegisterRequest request);
    }
}
