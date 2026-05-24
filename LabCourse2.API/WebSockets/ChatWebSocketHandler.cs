using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Messages;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Messages;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace LabCourse2.API.WebSockets
{
    public class ChatWebSocketHandler
    {
        private readonly ChatWebSocketConnectionManager _connectionManager;
        private readonly IMessageService _messageService;
        private readonly IAppDbContext _context;

        public ChatWebSocketHandler(
            ChatWebSocketConnectionManager connectionManager,
            IMessageService messageService,
            IAppDbContext context)
        {
            _connectionManager = connectionManager;
            _messageService = messageService;
            _context = context;
        }

        public async Task HandleAsync(HttpContext httpContext, WebSocket socket)
        {
            var socketId = _connectionManager.AddSocket(socket);
            var currentUserId = GetCurrentUserId(httpContext);

            if (currentUserId.HasValue)
            {
                _connectionManager.RegisterUserSocket(currentUserId.Value, socketId);
            }

            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var request = await ReceiveAsync(socket);

                    if (request == null)
                        break;

                    switch (request.Type)
                    {
                        case "join_room":
                            await JoinRoomAsync(httpContext, socket, socketId, request);
                            break;

                        case "send_message":
                            await SendMessageAsync(httpContext, socket, request);
                            break;

                        case "create_conversation":
                            await CreateConversationAsync(httpContext, socket, request);
                            break;

                        case "respond_conversation":
                            await RespondConversationAsync(httpContext, socket, request);
                            break;

                        case "get_unread_count":
                            await SendUnreadCountToCurrentSocketAsync(httpContext, socket);
                            break;

                        default:
                            await SendToSocketAsync(socket, new WebSocketEventResponse
                            {
                                Type = "error",
                                Error = "Unknown event type."
                            });
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = $"Internal server error: {ex.Message}"
                });
            }
            finally
            {
                await _connectionManager.RemoveSocketAsync(socketId);
            }
        }

        private Guid? GetCurrentUserId(HttpContext httpContext)
        {
            var userIdClaim =
                httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                httpContext.User.FindFirst("nameid")?.Value ??
                httpContext.User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
                return userId;

            return null;
        }

        private async Task JoinRoomAsync(HttpContext httpContext, WebSocket socket, string socketId, WebSocketEventRequest request)
        {
            if (!request.ConversationId.HasValue)
            {
                await SendErrorAsync(socket, "ConversationId is required.");
                return;
            }

            var userId = GetCurrentUserId(httpContext);
            if (!userId.HasValue)
            {
                await SendErrorAsync(socket, "Unauthorized.");
                return;
            }

            var conversationId = request.ConversationId.Value;

            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation == null)
            {
                await SendErrorAsync(socket, "Conversation not found.");
                return;
            }

            var isParticipant =
                conversation.Client.UserID == userId.Value ||
                conversation.Freelancer.UserID == userId.Value;

            if (!isParticipant)
            {
                await SendErrorAsync(socket, "Access denied.");
                return;
            }

            _connectionManager.AddToRoom(conversationId, socketId);

            await SendToSocketAsync(socket, new WebSocketEventResponse
            {
                Type = "room_joined",
                Payload = new { conversationId }
            });
        }

        private async Task CreateConversationAsync(HttpContext httpContext, WebSocket socket, WebSocketEventRequest request)
        {
            var result = await _messageService.CreateConversationAsync(new CreateConversationRequest
            {
                ContractID = request.ContractId,
                ClientID = request.ClientId,
                FreelancerID = request.FreelancerId,
                InitialMessage = request.Content
            });

            if (!result.IsSuccess || result.Data == null)
            {
                await SendErrorAsync(socket, result.Error ?? "Failed to create conversation.");
                return;
            }

            var createdConversation = result.Data;
            var participants = await GetConversationParticipantUserIds(createdConversation.ConversationID);

            await SendToSocketAsync(socket, new WebSocketEventResponse
            {
                Type = "conversation_created",
                Payload = createdConversation
            });

            foreach (var participant in participants)
            {
                foreach (var userSocket in _connectionManager.GetUserSockets(participant))
                {
                    await SendToSocketAsync(userSocket, new WebSocketEventResponse
                    {
                        Type = createdConversation.Status == "Pending"
                            ? "message_request_received"
                            : "conversation_created",
                        Payload = createdConversation
                    });
                }

                await PushUnreadCountToUserAsync(participant);
            }
        }

        private async Task SendMessageAsync(HttpContext httpContext, WebSocket socket, WebSocketEventRequest request)
        {
            if (!request.ConversationId.HasValue || string.IsNullOrWhiteSpace(request.Content))
            {
                await SendErrorAsync(socket, "ConversationId and content are required.");
                return;
            }

            var result = await _messageService.SendMessageAsync(new SendMessageRequest
            {
                ConversationID = request.ConversationId.Value,
                Content = request.Content
            });

            if (!result.IsSuccess || result.Data == null)
            {
                await SendErrorAsync(socket, result.Error ?? "Failed to send message.");
                return;
            }

            await BroadcastToRoomAsync(request.ConversationId.Value, new WebSocketEventResponse
            {
                Type = "message_created",
                Payload = result.Data
            });

            var participants = await GetConversationParticipantUserIds(request.ConversationId.Value);

            foreach (var participant in participants)
            {
                foreach (var userSocket in _connectionManager.GetUserSockets(participant))
                {
                    await SendToSocketAsync(userSocket, new WebSocketEventResponse
                    {
                        Type = "conversation_updated",
                        Payload = new { conversationId = request.ConversationId.Value }
                    });
                }

                await PushUnreadCountToUserAsync(participant);
            }
        }

        private async Task RespondConversationAsync(HttpContext httpContext, WebSocket socket, WebSocketEventRequest request)
        {
            if (!request.ConversationId.HasValue || !request.Accept.HasValue)
            {
                await SendErrorAsync(socket, "ConversationId and accept are required.");
                return;
            }

            var result = await _messageService.RespondToConversationRequestAsync(
                request.ConversationId.Value,
                request.Accept.Value);

            if (!result.IsSuccess || result.Data == null)
            {
                await SendErrorAsync(socket, result.Error ?? "Failed to respond to request.");
                return;
            }

            var responseType = request.Accept.Value
                ? "conversation_request_accepted"
                : "conversation_request_rejected";

            var participants = await GetConversationParticipantUserIds(request.ConversationId.Value);

            foreach (var participant in participants)
            {
                foreach (var userSocket in _connectionManager.GetUserSockets(participant))
                {
                    await SendToSocketAsync(userSocket, new WebSocketEventResponse
                    {
                        Type = responseType,
                        Payload = result.Data
                    });
                }

                await PushUnreadCountToUserAsync(participant);
            }
        }

        private async Task SendUnreadCountToCurrentSocketAsync(HttpContext httpContext, WebSocket socket)
        {
            var userId = GetCurrentUserId(httpContext);

            if (!userId.HasValue)
            {
                await SendErrorAsync(socket, "Unauthorized.");
                return;
            }

            var unreadCount = await GetUnreadConversationCountForUserAsync(userId.Value);

            await SendToSocketAsync(socket, new WebSocketEventResponse
            {
                Type = "inbox_unread_count_updated",
                Payload = new
                {
                    unreadCount
                }
            });
        }

        private async Task PushUnreadCountToUserAsync(Guid userId)
        {
            var unreadCount = await GetUnreadConversationCountForUserAsync(userId);

            foreach (var userSocket in _connectionManager.GetUserSockets(userId))
            {
                await SendToSocketAsync(userSocket, new WebSocketEventResponse
                {
                    Type = "inbox_unread_count_updated",
                    Payload = new
                    {
                        unreadCount
                    }
                });
            }
        }

        private async Task<int> GetUnreadConversationCountForUserAsync(Guid userId)
        {
            return await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .CountAsync(c =>
                    (c.Client.UserID == userId || c.Freelancer.UserID == userId) &&
                    c.Messages.Any(m => m.SenderUserID != userId && !m.IsRead));
        }

        private async Task<List<Guid>> GetConversationParticipantUserIds(Guid conversationId)
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

        private async Task BroadcastToRoomAsync(Guid conversationId, WebSocketEventResponse response)
        {
            var sockets = _connectionManager.GetRoomSockets(conversationId);

            foreach (var socket in sockets)
            {
                await SendToSocketAsync(socket, response);
            }
        }

        private async Task<WebSocketEventRequest?> ReceiveAsync(WebSocket socket)
        {
            var buffer = new byte[4096];
            using var ms = new MemoryStream();

            WebSocketReceiveResult result;

            do
            {
                result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                    return null;

                ms.Write(buffer, 0, result.Count);
            }
            while (!result.EndOfMessage);

            var json = Encoding.UTF8.GetString(ms.ToArray());

            return JsonSerializer.Deserialize<WebSocketEventRequest>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        private async Task SendToSocketAsync(WebSocket socket, WebSocketEventResponse response)
        {
            if (socket.State != WebSocketState.Open)
                return;

            var json = JsonSerializer.Serialize(response);
            var bytes = Encoding.UTF8.GetBytes(json);

            await socket.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None);
        }

        private Task SendErrorAsync(WebSocket socket, string error)
        {
            return SendToSocketAsync(socket, new WebSocketEventResponse
            {
                Type = "error",
                Error = error
            });
        }
    }
}