using LabCourse2.Application.DTOs.Messages;
using LabCourse2.Application.Interfaces.Messages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ConversationsController : BaseApiController
    {
        private readonly IMessageService _messageService;

        public ConversationsController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
        {
            var result = await _messageService.CreateConversationAsync(request);
            return ToActionResult(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyConversations()
        {
            var result = await _messageService.GetMyConversationsAsync();
            return ToActionResult(result);
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var result = await _messageService.GetPendingRequestsAsync();
            return ToActionResult(result);
        }

        [HttpGet("{conversationId:guid}/messages")]
        public async Task<IActionResult> GetMessages(Guid conversationId, [FromQuery] MessageQueryParams query)
        {
            var result = await _messageService.GetMessagesAsync(conversationId, query);
            return ToActionResult(result);
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var result = await _messageService.SendMessageAsync(request);
            return ToActionResult(result);
        }

        [HttpPatch("{conversationId:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid conversationId)
        {
            var result = await _messageService.MarkConversationAsReadAsync(conversationId);
            return ToActionResult(result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadConversationCount()
        {
            var result = await _messageService.GetUnreadConversationCountAsync();
            return ToActionResult(result);
        }
        [HttpPatch("{conversationId:guid}/respond")]
        public async Task<IActionResult> Respond(Guid conversationId, [FromBody] ConversationDecisionRequest request)
        {
            var result = await _messageService.RespondToConversationRequestAsync(conversationId, request.Accept);
            return ToActionResult(result);
        }
    }
}