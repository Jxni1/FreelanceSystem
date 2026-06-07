using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Messages;
using LabCourse2.Application.Interfaces.Messages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LabCourse2.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMessageService _messageService;
        private readonly IAppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ChatHub(
            IMessageService messageService,
            IAppDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _messageService = messageService;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task JoinRoom(Guid conversationId)
        {
            SyncHttpContext();

            var userId = CurrentUserId();
            if (userId == Guid.Empty)
            {
                await Clients.Caller.SendAsync("error", "Unauthorized.");
                return;
            }

            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation == null)
            {
                await Clients.Caller.SendAsync("error", "Conversation not found.");
                return;
            }

            var isParticipant =
                conversation.Client.UserID == userId ||
                conversation.Freelancer.UserID == userId;

            if (!isParticipant)
            {
                await Clients.Caller.SendAsync("error", "Access denied.");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, RoomName(conversationId));
            await Clients.Caller.SendAsync("room_joined", new { conversationId });
        }

        public async Task SendMessage(Guid conversationId, string content)
        {
            SyncHttpContext();

            if (conversationId == Guid.Empty || string.IsNullOrWhiteSpace(content))
            {
                await Clients.Caller.SendAsync("error", "ConversationId and content are required.");
                return;
            }

            var result = await _messageService.SendMessageAsync(new SendMessageRequest
            {
                ConversationID = conversationId,
                Content = content
            });

            if (!result.IsSuccess || result.Data == null)
            {
                await Clients.Caller.SendAsync("error", result.Error ?? "Failed to send message.");
                return;
            }

            await Clients.Group(RoomName(conversationId)).SendAsync("message_created", result.Data);

            foreach (var participant in await GetParticipantsAsync(conversationId))
            {
                await Clients.User(participant.ToString()).SendAsync("conversation_updated", new { conversationId });
                await PushUnreadCountAsync(participant);
            }
        }

        public async Task CreateConversation(Guid clientId, Guid freelancerId, string content)
        {
            SyncHttpContext();

            var result = await _messageService.CreateConversationAsync(new CreateConversationRequest
            {
                ClientID = clientId,
                FreelancerID = freelancerId,
                InitialMessage = content
            });

            if (!result.IsSuccess || result.Data == null)
            {
                await Clients.Caller.SendAsync("error", result.Error ?? "Failed to create conversation.");
                return;
            }

            var created = result.Data;

            await Clients.Caller.SendAsync("conversation_created", created);

            foreach (var participant in await GetParticipantsAsync(created.ConversationID))
            {
                var eventName = created.Status == "Pending"
                    ? "message_request_received"
                    : "conversation_created";

                await Clients.User(participant.ToString()).SendAsync(eventName, created);
                await PushUnreadCountAsync(participant);
            }
        }

        public async Task RespondConversation(Guid conversationId, bool accept)
        {
            SyncHttpContext();

            var result = await _messageService.RespondToConversationRequestAsync(conversationId, accept);

            if (!result.IsSuccess || result.Data == null)
            {
                await Clients.Caller.SendAsync("error", result.Error ?? "Failed to respond to request.");
                return;
            }

            var eventName = accept
                ? "conversation_request_accepted"
                : "conversation_request_rejected";

            foreach (var participant in await GetParticipantsAsync(conversationId))
            {
                await Clients.User(participant.ToString()).SendAsync(eventName, result.Data);
                await PushUnreadCountAsync(participant);
            }
        }

        public async Task GetUnreadCount()
        {
            SyncHttpContext();

            var userId = CurrentUserId();
            if (userId == Guid.Empty)
            {
                await Clients.Caller.SendAsync("error", "Unauthorized.");
                return;
            }

            var unreadCount = await GetUnreadConversationCountAsync(userId);
            await Clients.Caller.SendAsync("inbox_unread_count_updated", new { unreadCount });
        }

        private void SyncHttpContext()
        {
            _httpContextAccessor.HttpContext = Context.GetHttpContext();
        }

        private Guid CurrentUserId()
        {
            var claim =
                Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                Context.User?.FindFirst("nameid")?.Value ??
                Context.User?.FindFirst("sub")?.Value;

            return Guid.TryParse(claim, out var userId) ? userId : Guid.Empty;
        }

        private static string RoomName(Guid conversationId) => $"conversation:{conversationId}";

        private async Task PushUnreadCountAsync(Guid userId)
        {
            var unreadCount = await GetUnreadConversationCountAsync(userId);
            await Clients.User(userId.ToString()).SendAsync("inbox_unread_count_updated", new { unreadCount });
        }

        private async Task<int> GetUnreadConversationCountAsync(Guid userId)
        {
            return await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .CountAsync(c =>
                    (c.Client.UserID == userId || c.Freelancer.UserID == userId) &&
                    c.Messages.Any(m => m.SenderUserID != userId && !m.IsRead));
        }

        private async Task<List<Guid>> GetParticipantsAsync(Guid conversationId)
        {
            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstAsync(c => c.ConversationID == conversationId);

            return new List<Guid>
            {
                conversation.Client.UserID,
                conversation.Freelancer.UserID
            };
        }
    }
}
