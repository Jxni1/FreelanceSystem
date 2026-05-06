namespace LabCourse2.Application.DTOs.Users
{
    public class CreateUserByAdminRequest
    {
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
        public string Role { get; set; } = null!;

        public string? ExperienceLevel { get; set; }
        public decimal? HourlyRate { get; set; }

        public string? Bio { get; set; }
        public string? Industry { get; set; }
        public decimal? Budget { get; set; }
    }
}