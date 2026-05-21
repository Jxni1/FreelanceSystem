namespace LabCourse2.Application.DTOs.Users
{
    public class UserImportDto
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = "Admin123!";
        public string ConfirmPassword { get; set; } = "Admin123!";
        public string Role { get; set; } = string.Empty;

        public string? ExperienceLevel { get; set; }
        public decimal? HourlyRate { get; set; }

        public string? Bio { get; set; }
        public string? Industry { get; set; }
        public decimal? Budget { get; set; }
    }
}