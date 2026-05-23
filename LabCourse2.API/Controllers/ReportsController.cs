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
        [HttpGet("export")]
        public async Task<IActionResult> Export([FromQuery] ReportQueryParams query, [FromQuery] string format = "csv")
        {
            var result = await _reportService.ExportReportsAsync(query, format);

            if (!result.IsSuccess)
                return ToActionResult(result);

            // Replace Data with the real property name from your Result<T>
            var fileResult = result.Data;

            return File(fileResult.Content, fileResult.ContentType, fileResult.FileName);
        }

        [HttpPost("import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Import([FromForm] IFormFile file, [FromForm] string format = "csv")
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please upload a file.");

            var result = await _reportService.ImportReportsAsync(file, format);
            return ToActionResult(result);
        }
    }
}