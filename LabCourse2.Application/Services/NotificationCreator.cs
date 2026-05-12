using LabCourse2.Application.Common;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Services.Notifications
{
    public class NotificationCreator : INotificationCreator
    {
        private readonly IAppDbContext _context;

        public NotificationCreator(IAppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Guid userId, string type, string title, string message)
        {
            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                UserID = userId,
                Type = type,
                Title = title,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }

        public async Task CreateManyAsync(IEnumerable<Guid> userIds, string type, string title, string message)
        {
            var notifications = userIds
                .Distinct()
                .Select(userId => new Notification
                {
                    NotificationID = Guid.NewGuid(),
                    UserID = userId,
                    Type = type,
                    Title = title,
                    Message = message,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                })
                .ToList();

            if (!notifications.Any()) return;

            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();
        }
    }
}