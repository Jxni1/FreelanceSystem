using LabCourse2.API.Hubs;
using LabCourse2.Application.Common;
using LabCourse2.Application.Interfaces.Messages;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

private readonly IHubContext<ChatHub> _hubContext;

public MessageService(
    IAppDbContext context,
    ICurrentUserService currentUser,
    IHubContext<ChatHub> hubContext)
{
    _context = context;
    _currentUser = currentUser;
    _hubContext = hubContext;
}