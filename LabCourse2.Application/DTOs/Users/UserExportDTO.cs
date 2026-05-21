namespace LabCourse2.Application.DTOs.Users
{
    public class UserExportDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string Roles { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}