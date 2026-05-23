using LabCourse2.API.Hubs;
using LabCourse2.Application.DTOs.Messages;
using Microsoft.AspNetCore.SignalR;

namespace LabCourse2.API.Services.Chat
{
    public class ChatNotifier : IChatNotifier
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatNotifier(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyMessageCreatedAsync(MessageResponse message)
        {
            await _hubContext.Clients
                .Group($"conversation-{message.ConversationID}")
                .SendAsync("ReceiveMessage", message);
        }
    }
}