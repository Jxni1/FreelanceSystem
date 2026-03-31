namespace LabCourse2.Application.DTOs.Auth
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public List<string> Errors { get; set; } = new();
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public Guid? UserId { get; set; }
        public string? Role { get; set; }

        public static AuthResult Ok(string accessToken, string refreshToken, Guid userId, string role) =>
            new()
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserId = userId,
                Role = role
            };

        public static AuthResult Fail(params string[] errors) =>
            new() { Success = false, Errors = errors.ToList() };
    }
}
