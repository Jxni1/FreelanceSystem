namespace LabCourse2.API.WebSockets
{
    public class WebSocketEventResponse
    {
        public string Type { get; set; } = string.Empty;
        public object? Payload { get; set; }
        public string? Error { get; set; }
    }
}