using FluentValidation;
using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Application.Interfaces.Proposals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ProposalsController : BaseApiController
    {
        private readonly IProposalService _proposalService;
        private readonly IValidator<CreateProposalRequest> _createValidator;

        public ProposalsController(
            IProposalService proposalService,
            IValidator<CreateProposalRequest> createValidator)
        {
            _proposalService = proposalService;
            _createValidator = createValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProposalQueryParams query)
        {
            var result = await _proposalService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _proposalService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProposalRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _proposalService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPatch("{id:guid}/accept")]
        public async Task<IActionResult> Accept(Guid id)
        {
            var result = await _proposalService.AcceptAsync(id);
            return ToActionResult(result);
        }

        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var result = await _proposalService.RejectAsync(id);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _proposalService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
