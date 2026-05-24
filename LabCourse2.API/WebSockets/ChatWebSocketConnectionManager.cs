using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace LabCourse2.API.WebSockets
{
    public class ChatWebSocketConnectionManager
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
        private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, bool>> _rooms = new();
        private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, bool>> _userSockets = new();
        private readonly ConcurrentDictionary<string, Guid> _socketUsers = new();

        public string AddSocket(WebSocket socket)
        {
            var socketId = Guid.NewGuid().ToString();
            _sockets.TryAdd(socketId, socket);
            return socketId;
        }

        public void RegisterUserSocket(Guid userId, string socketId)
        {
            _socketUsers[socketId] = userId;
            var userRoom = _userSockets.GetOrAdd(userId, _ => new ConcurrentDictionary<string, bool>());
            userRoom.TryAdd(socketId, true);
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

        public void RemoveFromUserRooms(string socketId)
        {
            foreach (var room in _userSockets.Values)
            {
                room.TryRemove(socketId, out _);
            }

            _socketUsers.TryRemove(socketId, out _);
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

        public List<WebSocket> GetUserSockets(Guid userId)
        {
            if (!_userSockets.TryGetValue(userId, out var room))
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
            RemoveFromUserRooms(socketId);

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