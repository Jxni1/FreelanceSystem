using LabCourse2.Application.Common;
//interface per me kriju notif
namespace LabCourse2.Application.Interfaces.Notifications
{
    public interface INotificationCreator
    {
        Task CreateAsync(Guid userId, string type, string title, string message);
        Task CreateManyAsync(IEnumerable<Guid> userIds, string type, string title, string message);
    }
}