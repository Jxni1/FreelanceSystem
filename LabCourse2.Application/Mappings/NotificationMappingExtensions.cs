using LabCourse2.Application.DTOs.Notifications;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class NotificationMappingExtensions
    {
        public static NotificationResponse ToResponse(this Notification notification) =>
            new()
            {
                NotificationID = notification.NotificationID,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                UserID = notification.UserID
            };

        public static Notification ToEntity(this CreateNotificationRequest request) =>
            new()
            {
                NotificationID = Guid.NewGuid(),
                UserID = request.UserID,
                Type = request.Type,
                Title = request.Title,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

        public static void ApplyUpdate(this Notification notification, UpdateNotificationRequest request)
        {
            notification.Type = request.Type;
            notification.Title = request.Title;
            notification.Message = request.Message;
            notification.IsRead = request.IsRead;
        }
    }
}