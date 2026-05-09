using FluentValidation;
using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Application.Interfaces.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ReportsController : BaseApiController
    {
        private readonly IReportService _reportService;
        private readonly IValidator<CreateReportRequest> _createValidator;
        private readonly IValidator<UpdateReportStatusRequest> _updateStatusValidator;

        public ReportsController(
            IReportService reportService,
            IValidator<CreateReportRequest> createValidator,
            IValidator<UpdateReportStatusRequest> updateStatusValidator)
        {
            _reportService = reportService;
            _createValidator = createValidator;
            _updateStatusValidator = updateStatusValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ReportQueryParams query)
        {
            var result = await _reportService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _reportService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReportRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _reportService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReportStatusRequest request)
        {
            var validation = await _updateStatusValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _reportService.UpdateStatusAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _reportService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}