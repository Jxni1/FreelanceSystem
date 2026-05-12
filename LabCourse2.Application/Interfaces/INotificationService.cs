using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Notifications;

namespace LabCourse2.Application.Interfaces.Notifications
{
    public interface INotificationService
    {
        Task<Result<PagedResult<NotificationResponse>>> GetAllAsync(NotificationQueryParams query);
        Task<Result<NotificationResponse>> GetByIdAsync(Guid id);
        Task<Result<NotificationResponse>> CreateAsync(CreateNotificationRequest request);
        Task<Result<NotificationResponse>> UpdateAsync(Guid id, UpdateNotificationRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);

        Task<Result<int>> GetUnreadCountAsync();
        Task<Result<bool>> MarkAsReadAsync(Guid id);
        Task<Result<bool>> MarkAsUnreadAsync(Guid id);
        Task<Result<bool>> MarkAllAsReadAsync();
        Task<Result<bool>> DeleteAllReadAsync();
    }
}