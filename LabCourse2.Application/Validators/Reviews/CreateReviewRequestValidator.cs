using FluentValidation;
using LabCourse2.Application.DTOs.Reviews;

namespace LabCourse2.Application.Validators.Reviews
{
    public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
    {
        public CreateReviewRequestValidator()
        {
            RuleFor(x => x.ContractID)
                .NotEmpty().WithMessage("Contract ID is required.");

            RuleFor(x => x.Comment)
                .NotEmpty().WithMessage("Comment is required.")
                .MaximumLength(2000).WithMessage("Comment cannot exceed 2000 characters.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
        }
    }
}
