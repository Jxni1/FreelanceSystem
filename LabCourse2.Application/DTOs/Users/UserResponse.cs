namespace LabCourse2.Application.DTOs.Users
{
    public class UserResponse
    {
        public Guid UserID { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Surname { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public string? ProfilePhoto { get; init; }


        public List<string> Roles { get; init; } = new();
    }
}