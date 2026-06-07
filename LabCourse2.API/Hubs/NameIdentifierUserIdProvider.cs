using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace LabCourse2.API.Hubs
{
    public class NameIdentifierUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return
                connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                connection.User?.FindFirst("nameid")?.Value ??
                connection.User?.FindFirst("sub")?.Value;
        }
    }
}
