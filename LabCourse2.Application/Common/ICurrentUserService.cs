namespace LabCourse2.Application.Common
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        string? Username { get; }
        string? ProfileType { get; }
        bool IsAuthenticated { get; }
    }
}