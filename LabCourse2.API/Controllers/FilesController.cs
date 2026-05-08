using FluentValidation;
using LabCourse2.Application.DTOs.Files;
using LabCourse2.Application.Interfaces.Files;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/files")]
    [Authorize]
    public class FilesController : BaseApiController
    {
        private readonly IFileService _fileService;
        private readonly IValidator<UploadFileRequest> _uploadValidator;
        private readonly IValidator<UpdateFileRequest> _updateValidator;

        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok("files controller works");
        }
        public FilesController(
            IFileService fileService,
            IValidator<UploadFileRequest> uploadValidator,
            IValidator<UpdateFileRequest> updateValidator)
        {
            _fileService = fileService;
            _uploadValidator = uploadValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FileQueryParams query)
        {
            var result = await _fileService.GetAllAsync(query);
            return ConvertResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _fileService.GetByIdAsync(id);
            return ConvertResult(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadFileRequest request)
        {
            var validation = await _uploadValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _fileService.UploadAsync(request);
            return ConvertResult(result);
        }

        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateFileRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _fileService.UpdateAsync(id, request);
            return ConvertResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _fileService.DeleteAsync(id);
            return ConvertResult(result);
        }

        private IActionResult ConvertResult(object result)
        {
            return Ok(result);
        }
    }
}