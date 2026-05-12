using FluentValidation;
using LabCourse2.Application.DTOs.Notifications;
using LabCourse2.Application.Interfaces.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;
        private readonly IValidator<CreateNotificationRequest> _createValidator;
        private readonly IValidator<UpdateNotificationRequest> _updateValidator;

        public NotificationsController(
            INotificationService notificationService,
            IValidator<CreateNotificationRequest> createValidator,
            IValidator<UpdateNotificationRequest> updateValidator)
        {
            _notificationService = notificationService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] NotificationQueryParams query)
        {
            var result = await _notificationService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _notificationService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var result = await _notificationService.GetUnreadCountAsync();
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _notificationService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNotificationRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _notificationService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}/mark-read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var result = await _notificationService.MarkAsReadAsync(id);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}/mark-unread")]
        public async Task<IActionResult> MarkAsUnread(Guid id)
        {
            var result = await _notificationService.MarkAsUnreadAsync(id);
            return ToActionResult(result);
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var result = await _notificationService.MarkAllAsReadAsync();
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _notificationService.DeleteAsync(id);
            return ToActionResult(result);
        }

        [HttpDelete("read")]
        public async Task<IActionResult> DeleteAllRead()
        {
            var result = await _notificationService.DeleteAllReadAsync();
            return ToActionResult(result);
        }
    }
}