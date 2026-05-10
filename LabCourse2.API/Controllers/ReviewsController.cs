using FluentValidation;
using LabCourse2.Application.DTOs.Reviews;
using LabCourse2.Application.Interfaces.Reviews;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ReviewsController : BaseApiController
    {
        private readonly IReviewService _reviewService;
        private readonly IValidator<CreateReviewRequest> _createValidator;
        private readonly IValidator<UpdateReviewRequest> _updateValidator;

        public ReviewsController(
            IReviewService reviewService,
            IValidator<CreateReviewRequest> createValidator,
            IValidator<UpdateReviewRequest> updateValidator)
        {
            _reviewService = reviewService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ReviewQueryParams query)
        {
            var result = await _reviewService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _reviewService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var validation = await _createValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _reviewService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewRequest request)
        {
            var validation = await _updateValidator.ValidateAsync(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

            var result = await _reviewService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _reviewService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
