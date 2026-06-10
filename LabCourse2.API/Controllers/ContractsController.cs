using FluentValidation;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.Interfaces.Contracts;
using LabCourse2.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ContractsController : BaseApiController
    {
        private readonly IContractService _contractService;
        private readonly IValidator<CreateContractRequest> _createValidator;
        private readonly IValidator<UpdateContractRequest> _updateValidator;

        public ContractsController(
            IContractService contractService,
            IValidator<CreateContractRequest> createValidator,
            IValidator<UpdateContractRequest> updateValidator)
        {
            _contractService = contractService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet("all")]
        [HasPermission("contracts.manage")]
        public async Task<IActionResult> GetAll([FromQuery] ContractQueryParams query)
        {
            var result = await _contractService.GetAllAsync(query);
            return ToActionResult(result);
        }

        /// <summary>
        /// Client users - gets only their own contracts as client
        /// </summary>
        [HttpGet("client")]
        public async Task<IActionResult> GetMyClientContracts([FromQuery] ContractQueryParams query)
        {
            var result = await _contractService.GetContractsByClientIDAsync(query);
            return ToActionResult(result);
        }

        /// <summary>
        /// Freelancer users - gets only their own contracts as freelancer
        /// </summary>
        [HttpGet("freelancer")]
        public async Task<IActionResult> GetMyFreelancerContracts([FromQuery] ContractQueryParams query)
        {
            var result = await _contractService.GetContractsByFreelancerIDAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _contractService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContractRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _contractService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContractRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _contractService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _contractService.DeleteAsync(id);
            return ToActionResult(result);
        }
        [HttpGet("export")]
        [HasPermission("contracts.manage")]
        public async Task<IActionResult> ExportContracts([FromQuery] ContractQueryParams query, [FromQuery] string format = "csv")
        {
            var result = await _contractService.ExportContractsAsync(query, format);

            if (!result.IsSuccess || result.Data is null)
                return ToActionResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpPost("import")]
        [HasPermission("contracts.manage")]
        public async Task<IActionResult> ImportContracts([FromForm] IFormFile file, [FromQuery] string format = "csv")
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required.");

            var result = await _contractService.ImportContractsAsync(file, format);
            return ToActionResult(result);
        }
    }
}
