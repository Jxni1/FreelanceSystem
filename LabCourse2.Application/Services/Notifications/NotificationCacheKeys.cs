using System;

namespace LabCourse2.Application.Services.Notifications
{
    public static class NotificationCacheKeys
    {
        public static string UnreadCount(Guid userId) => $"notifications_unread_{userId}";

        public static readonly TimeSpan UnreadCountTtl = TimeSpan.FromHours(1);
    }
}
