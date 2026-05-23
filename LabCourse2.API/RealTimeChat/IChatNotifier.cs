using LabCourse2.Application.DTOs.Messages;

namespace LabCourse2.API.Services.Chat
{
    public interface IChatNotifier
    {
        Task NotifyMessageCreatedAsync(MessageResponse message);
    }
}