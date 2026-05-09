namespace LabCourse2.Application.DTOs.Users
{
    public class UserListItemDto
    {
        public Guid UserId { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Surname { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
        public List<string> Roles { get; init; } = new();
    }
}