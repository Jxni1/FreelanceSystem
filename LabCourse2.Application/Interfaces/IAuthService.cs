using LabCourse2.Application.DTOs.Auth;

namespace LabCourse2.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request, string? userAgent = null, string? ip = null);
        Task<AuthResult> RegisterAdminAsync(RegisterRequest request, string? userAgent = null, string? ip = null);

        Task<AuthResult> LoginAsync(LoginRequest request, string? userAgent = null, string? ip = null);


        Task<AuthResult> RefreshTokenAsync(string rawRefreshToken, string? userAgent = null, string? ip = null);

        Task<UserProfileDto?> GetUserProfileAsync(Guid userId);

        Task<AuthResult> RevokeTokenAsync(string rawRefreshToken);
    }
}