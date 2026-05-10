using FluentValidation;
using LabCourse2.Application.DTOs.Reviews;

namespace LabCourse2.Application.Validators.Reviews
{
    public class UpdateReviewRequestValidator : AbstractValidator<UpdateReviewRequest>
    {
        public UpdateReviewRequestValidator()
        {
            RuleFor(x => x.Comment)
                .NotEmpty().WithMessage("Comment is required.")
                .MaximumLength(2000).WithMessage("Comment cannot exceed 2000 characters.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
        }
    }
}