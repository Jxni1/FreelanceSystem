using FluentValidation;
using LabCourse2.Application.DTOs.Categories;
using LabCourse2.Application.Interfaces.Categories;
using LabCourse2.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class CategoriesController : BaseApiController
    {
        private readonly ICategoryService _categoryService;
        private readonly IValidator<CreateCategoryRequest> _createValidator;
        private readonly IValidator<UpdateCategoryRequest> _updateValidator;

        public CategoriesController(
            ICategoryService categoryService,
            IValidator<CreateCategoryRequest> createValidator,
            IValidator<UpdateCategoryRequest> updateValidator)
        {
            _categoryService = categoryService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] CategoryQueryParams query)
        {
            var result = await _categoryService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _categoryService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        [HasPermission("categories.manage")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _categoryService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        [HasPermission("categories.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _categoryService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        [HasPermission("categories.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _categoryService.DeleteAsync(id);
            return ToActionResult(result);
        }

        [HttpGet("export")]
        [HasPermission("categories.manage")]
        public async Task<IActionResult> Export(
            [FromQuery] CategoryQueryParams query,
            [FromQuery] string format = "csv")
        {
            var result = await _categoryService.ExportCategoriesAsync(query, format);

            if (!result.IsSuccess)
                return ToActionResult(result);

            var fileResult = result.Data;

            return File(fileResult.Content, fileResult.ContentType, fileResult.FileName);
        }

        [HttpPost("import")]
        [HasPermission("categories.manage")]
        public async Task<IActionResult> Import(
            [FromForm] IFormFile file,
            [FromForm] string format = "csv")
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please upload a file.");

            var result = await _categoryService.ImportCategoriesAsync(file, format);
            return ToActionResult(result);
        }
    }
}