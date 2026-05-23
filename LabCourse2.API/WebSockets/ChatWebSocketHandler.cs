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
            Console.WriteLine($"[WS] Socket connected: {socketId}");

            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var request = await ReceiveAsync(socket);

                    if (request == null)
                    {
                        Console.WriteLine($"[WS] Null request, closing socket: {socketId}");
                        break;
                    }

                    Console.WriteLine($"[WS] Event={request.Type}, ConversationId={request.ConversationId}");

                    switch (request.Type)
                    {
                        case "join_room":
                            await JoinRoomAsync(httpContext, socket, socketId, request);
                            break;

                        case "send_message":
                            await SendMessageAsync(httpContext, socket, request);
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
                Console.WriteLine($"[WS] Handler exception: {ex.Message}");

                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "Internal server error."
                });
            }
            finally
            {
                Console.WriteLine($"[WS] Removing socket: {socketId}");
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
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "ConversationId is required."
                });
                return;
            }

            var userId = GetCurrentUserId(httpContext);
            if (!userId.HasValue)
            {
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "Unauthorized."
                });
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
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "Conversation not found."
                });
                return;
            }

            var isParticipant =
                conversation.Client.UserID == userId.Value ||
                conversation.Freelancer.UserID == userId.Value;

            if (!isParticipant)
            {
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "Access denied."
                });
                return;
            }

            _connectionManager.AddToRoom(conversationId, socketId);

            Console.WriteLine($"[WS] Socket {socketId} joined room {conversationId}");

            await SendToSocketAsync(socket, new WebSocketEventResponse
            {
                Type = "room_joined",
                Payload = new { conversationId }
            });
        }

        private async Task SendMessageAsync(HttpContext httpContext, WebSocket socket, WebSocketEventRequest request)
        {
            if (!request.ConversationId.HasValue || string.IsNullOrWhiteSpace(request.Content))
            {
                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = "ConversationId and content are required."
                });
                return;
            }

            Console.WriteLine($"[WS] Saving message for conversation {request.ConversationId.Value}");

            var result = await _messageService.SendMessageAsync(new SendMessageRequest
            {
                ConversationID = request.ConversationId.Value,
                Content = request.Content
            });

            if (!result.IsSuccess || result.Data == null)
            {
                Console.WriteLine($"[WS] Message save failed: {result.Error}");

                await SendToSocketAsync(socket, new WebSocketEventResponse
                {
                    Type = "error",
                    Error = result.Error ?? "Failed to send message."
                });
                return;
            }

            Console.WriteLine($"[WS] Message saved: {result.Data.MessageID}");

            var response = new WebSocketEventResponse
            {
                Type = "message_created",
                Payload = result.Data
            };

            await BroadcastToRoomAsync(request.ConversationId.Value, response);
        }

        private async Task BroadcastToRoomAsync(Guid conversationId, WebSocketEventResponse response)
        {
            var sockets = _connectionManager.GetRoomSockets(conversationId);

            Console.WriteLine($"[WS] Broadcasting to {sockets.Count} sockets in room {conversationId}");

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
            Console.WriteLine($"[WS] Raw message: {json}");

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
    }
}