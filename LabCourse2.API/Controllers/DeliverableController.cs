
using FluentValidation;
using LabCourse2.Application.DTOs.Deliverables;
using LabCourse2.Application.Interfaces.Deliverables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class DeliverablesController : BaseApiController
    {
        private readonly IDeliverableService _deliverableService;
        private readonly IValidator<CreateDeliverableRequest> _createValidator;

        public DeliverablesController(
            IDeliverableService deliverableService,
            IValidator<CreateDeliverableRequest> createValidator)
        {
            _deliverableService = deliverableService;
            _createValidator = createValidator;
        }

      
        [HttpGet("milestone/{milestoneId:guid}")]
        public async Task<IActionResult> GetAllByMilestone(
            Guid milestoneId, [FromQuery] DeliverableQueryParams query)
        {
            var result = await _deliverableService.GetAllByMilestoneAsync(milestoneId, query);
            return ToActionResult(result);
        }

        
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _deliverableService.GetByIdAsync(id);
            return ToActionResult(result);
        }

       
        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] CreateDeliverableRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _deliverableService.SubmitAsync(request);
            return ToActionResult(result);
        }

        [HttpPatch("{id:guid}/approve")]
        public async Task<IActionResult> Approve(Guid id)
        {
            var result = await _deliverableService.ApproveAsync(id);
            return ToActionResult(result);
        }

       
        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var result = await _deliverableService.RejectAsync(id);
            return ToActionResult(result);
        }

       
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _deliverableService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
