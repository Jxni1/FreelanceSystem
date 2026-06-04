using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Emails;
using LabCourse2.Application.Interfaces.Emails;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Notifications
{
    public class NotificationCreator : INotificationCreator
    {
        private readonly IAppDbContext _context;
        private readonly IEmailQueue _emailQueue;

        private static readonly HashSet<string> EmailableTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "ContractCreated",
            "ProposalSubmitted",
            "ProposalAccepted",
            "ProposalRejected",
            "DeliverableApproved",
            "DeliverableRejected",
            "ReviewReceived"
        };

        public NotificationCreator(IAppDbContext context, IEmailQueue emailQueue)
        {
            _context = context;
            _emailQueue = emailQueue;
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

            await QueueEmailsAsync(new[] { userId }, type, title, message);
        }

        public async Task CreateManyAsync(IEnumerable<Guid> userIds, string type, string title, string message)
        {
            var distinctIds = userIds.Distinct().ToList();

            var notifications = distinctIds
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

            if (notifications.Count == 0) return;

            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();

            await QueueEmailsAsync(distinctIds, type, title, message);
        }

        private async Task QueueEmailsAsync(IReadOnlyCollection<Guid> userIds, string type, string title, string message)
        {
            if (!EmailableTypes.Contains(type) || userIds.Count == 0)
                return;

            var recipients = await _context.Users
                .Where(u => userIds.Contains(u.UserID) && u.Is_Active && !u.Is_Deleted && u.Email != null)
                .Select(u => new { u.Name, u.Email })
                .ToListAsync();

            foreach (var recipient in recipients)
            {
                if (string.IsNullOrWhiteSpace(recipient.Email))
                    continue;

                _emailQueue.Enqueue(new EmailMessage(recipient.Email, title, BuildHtmlBody(recipient.Name, title, message)));
            }
        }

        private static string BuildHtmlBody(string name, string title, string message)
        {
            return $@"<div style=""font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px"">
  <h2 style=""color:#1a1a1a;margin:0 0 12px"">{title}</h2>
  <p style=""color:#333;font-size:15px;line-height:1.5"">Hi {name},</p>
  <p style=""color:#333;font-size:15px;line-height:1.5"">{message}</p>
  <hr style=""border:none;border-top:1px solid #eee;margin:24px 0"" />
  <p style=""color:#999;font-size:12px"">You are receiving this email because of activity on your LabCourse2 account.</p>
</div>";
        }
    }
}
