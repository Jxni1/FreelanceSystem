
namespace LabCourse2.Application.DTOs.Auth
{
    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = null!;
    }

    public class RevokeTokenRequest
    {
        public string RefreshToken { get; set; } = null!;
    }
}