using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Notifications;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Mappings;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly ICacheService _cacheService;

        public NotificationService(IAppDbContext context, ICurrentUserService currentUser, ICacheService cacheService)
        {
            _context = context;
            _currentUser = currentUser;
            _cacheService = cacheService;
        }

        public async Task<Result<PagedResult<NotificationResponse>>> GetAllAsync(NotificationQueryParams query)
        {
            var q = _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserID == _currentUser.UserId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Type))
                q = q.Where(n => n.Type == query.Type);

            if (query.IsRead.HasValue)
                q = q.Where(n => n.IsRead == query.IsRead.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(n =>
                    n.Title.Contains(query.Search) ||
                    n.Message.Contains(query.Search));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(n => n.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(n => n.ToResponse())
                .ToListAsync();

            return Result<PagedResult<NotificationResponse>>.Success(new PagedResult<NotificationResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<NotificationResponse>> GetByIdAsync(Guid id)
        {
            var notification = await _context.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == _currentUser.UserId);

            if (notification is null)
                return Result<NotificationResponse>.NotFound($"Notification with ID {id} was not found.");

            return Result<NotificationResponse>.Success(notification.ToResponse());
        }

        public async Task<Result<NotificationResponse>> CreateAsync(CreateNotificationRequest request)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.UserID == request.UserID);

            if (!userExists)
                return Result<NotificationResponse>.NotFound("User not found.");

            var notification = request.ToEntity();

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            var created = await _context.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.NotificationID == notification.NotificationID);

            await _cacheService.AdjustCounterIfExistsAsync(
                NotificationCacheKeys.UnreadCount(notification.UserID), 1);

            return Result<NotificationResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<NotificationResponse>> UpdateAsync(Guid id, UpdateNotificationRequest request)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == _currentUser.UserId);

            if (notification is null)
                return Result<NotificationResponse>.NotFound($"Notification with ID {id} was not found.");

            var wasRead = notification.IsRead;

            notification.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            if (wasRead != notification.IsRead)
                await _cacheService.AdjustCounterIfExistsAsync(
                    NotificationCacheKeys.UnreadCount(notification.UserID),
                    notification.IsRead ? -1 : 1);

            var updated = await _context.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.NotificationID == notification.NotificationID);

            return Result<NotificationResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == _currentUser.UserId);

            if (notification is null)
                return Result<bool>.NotFound($"Notification with ID {id} was not found.");

            var wasUnread = !notification.IsRead;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            if (wasUnread)
                await _cacheService.AdjustCounterIfExistsAsync(
                    NotificationCacheKeys.UnreadCount(notification.UserID), -1);

            return Result<bool>.Success(true);
        }

        public async Task<Result<int>> GetUnreadCountAsync()
        {
            var key = NotificationCacheKeys.UnreadCount(_currentUser.UserId);

            var cached = await _cacheService.GetCounterAsync(key);
            if (cached.HasValue)
                return Result<int>.Success((int)cached.Value);

            var count = await _context.Notifications
                .AsNoTracking()
                .CountAsync(n => n.UserID == _currentUser.UserId && !n.IsRead);

            await _cacheService.SetCounterAsync(key, count, NotificationCacheKeys.UnreadCountTtl);

            return Result<int>.Success(count);
        }

        public async Task<Result<bool>> MarkAsReadAsync(Guid id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == _currentUser.UserId);

            if (notification is null)
                return Result<bool>.NotFound($"Notification with ID {id} was not found.");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();

                await _cacheService.AdjustCounterIfExistsAsync(
                    NotificationCacheKeys.UnreadCount(notification.UserID), -1);
            }

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> MarkAsUnreadAsync(Guid id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == _currentUser.UserId);

            if (notification is null)
                return Result<bool>.NotFound($"Notification with ID {id} was not found.");

            if (notification.IsRead)
            {
                notification.IsRead = false;
                await _context.SaveChangesAsync();

                await _cacheService.AdjustCounterIfExistsAsync(
                    NotificationCacheKeys.UnreadCount(notification.UserID), 1);
            }

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> MarkAllAsReadAsync()
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserID == _currentUser.UserId && !n.IsRead)
                .ToListAsync();

            if (notifications.Any())
            {
                foreach (var notification in notifications)
                    notification.IsRead = true;

                await _context.SaveChangesAsync();
            }

            await _cacheService.SetCounterAsync(
                NotificationCacheKeys.UnreadCount(_currentUser.UserId), 0, NotificationCacheKeys.UnreadCountTtl);

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteAllReadAsync()
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserID == _currentUser.UserId && n.IsRead)
                .ToListAsync();

            if (!notifications.Any())
                return Result<bool>.Success(true);

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}