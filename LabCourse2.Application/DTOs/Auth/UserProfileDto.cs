namespace LabCourse2.Application.DTOs.Auth
{
    public class UserProfileDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();

        public FreelancerProfileDto? FreelancerProfile { get; set; }
        public ClientProfileDto? ClientProfile { get; set; }
    }

    public class FreelancerProfileDto
    {
        public string ExperienceLevel { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
    }

    public class ClientProfileDto
    {
        public string Bio { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public decimal Budget { get; set; }
    }
}
