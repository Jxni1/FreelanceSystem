using LabCourse2.Application.Common;
using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public ChatHub(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task JoinConversation(Guid conversationId)
        {
            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation is null)
                throw new HubException("Conversation not found.");

            var isParticipant =
                conversation.Client.UserID == _currentUser.UserId ||
                conversation.Freelancer.UserID == _currentUser.UserId ||
                _currentUser.IsAdmin;

            if (!isParticipant)
                throw new HubException("Access denied.");

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
        }
    }
}