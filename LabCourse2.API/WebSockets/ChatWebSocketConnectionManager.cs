using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace LabCourse2.API.WebSockets
{
    public class ChatWebSocketConnectionManager
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
        private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, bool>> _rooms = new();

        public string AddSocket(WebSocket socket)
        {
            var socketId = Guid.NewGuid().ToString();
            _sockets.TryAdd(socketId, socket);
            return socketId;
        }

        public void AddToRoom(Guid conversationId, string socketId)
        {
            var room = _rooms.GetOrAdd(conversationId, _ => new ConcurrentDictionary<string, bool>());
            room.TryAdd(socketId, true);
        }

        public void RemoveFromAllRooms(string socketId)
        {
            foreach (var room in _rooms.Values)
            {
                room.TryRemove(socketId, out _);
            }
        }

        public List<WebSocket> GetRoomSockets(Guid conversationId)
        {
            if (!_rooms.TryGetValue(conversationId, out var room))
                return new List<WebSocket>();

            return room.Keys
                .Where(id => _sockets.ContainsKey(id))
                .Select(id => _sockets[id])
                .Where(s => s.State == WebSocketState.Open)
                .ToList();
        }

        public async Task RemoveSocketAsync(string socketId)
        {
            RemoveFromAllRooms(socketId);

            if (_sockets.TryRemove(socketId, out var socket))
            {
                if (socket.State == WebSocketState.Open || socket.State == WebSocketState.CloseReceived)
                {
                    await socket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Closed",
                        CancellationToken.None);
                }

                socket.Dispose();
            }
        }
    }
}