
using FluentValidation;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.Interfaces.Milestones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class MilestonesController : BaseApiController
    {
        private readonly IMilestoneService _milestoneService;
        private readonly IValidator<CreateMilestoneRequest> _createValidator;
        private readonly IValidator<UpdateMilestoneRequest> _updateValidator;

        public MilestonesController(
            IMilestoneService milestoneService,
            IValidator<CreateMilestoneRequest> createValidator,
            IValidator<UpdateMilestoneRequest> updateValidator)
        {
            _milestoneService = milestoneService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

    
        [HttpGet("contract/{contractId:guid}")]
        public async Task<IActionResult> GetAllByContract(
            Guid contractId, [FromQuery] MilestoneQueryParams query)
        {
            var result = await _milestoneService.GetAllByContractAsync(contractId, query);
            return ToActionResult(result);
        }

       
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _milestoneService.GetByIdAsync(id);
            return ToActionResult(result);
        }

       
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMilestoneRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _milestoneService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMilestoneRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _milestoneService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

      
        [HttpPatch("{id:guid}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var result = await _milestoneService.CompleteAsync(id);
            return ToActionResult(result);
        }

       
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _milestoneService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
