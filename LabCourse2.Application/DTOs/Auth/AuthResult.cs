namespace LabCourse2.Application.DTOs.Auth
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public bool IsTheftDetected { get; set; }
        public List<string> Errors { get; set; } = new();
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public Guid? UserId { get; set; }

        public List<string> Roles { get; set; } = new();

        public string? ProfileType { get; set; }

        public static AuthResult Ok(
            string accessToken,
            string refreshToken,
            Guid userId,
            IEnumerable<string> roles,
            string profileType) =>
            new()
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserId = userId,
                Roles = roles.ToList(),
                ProfileType = profileType
            };

        public static AuthResult Fail(params string[] errors) =>
            new() { Success = false, Errors = errors.ToList() };

        public static AuthResult TheftDetected() =>
            new() { Success = false, IsTheftDetected = true };
    }
}