using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Messages;

namespace LabCourse2.Application.Interfaces.Messages
{
    public interface IMessageService
    {
        Task<Result<ConversationResponse>> CreateConversationAsync(CreateConversationRequest request);
        Task<Result<IEnumerable<ConversationResponse>>> GetMyConversationsAsync();
        Task<Result<IEnumerable<ConversationResponse>>> GetPendingRequestsAsync();
        Task<Result<PagedResult<MessageResponse>>> GetMessagesAsync(Guid conversationId, MessageQueryParams query);
        Task<Result<MessageResponse>> SendMessageAsync(SendMessageRequest request);
        Task<Result<ConversationResponse>> RespondToConversationRequestAsync(Guid conversationId, bool accept);
        Task<Result<bool>> MarkConversationAsReadAsync(Guid conversationId);

        Task<Result<int>> GetUnreadConversationCountAsync();
    }
}