using FluentValidation;
using LabCourse2.Application.DTOs.Milestones;

namespace LabCourse2.Application.Validators.Milestones
{
    public class SubmitMilestoneRequestValidator : AbstractValidator<SubmitMilestoneRequest>
    {
        public SubmitMilestoneRequestValidator()
        {
            RuleFor(x => x)
                .Must(x => x.FileIds.Count > 0 || !string.IsNullOrWhiteSpace(x.Note))
                .WithMessage("At least one file or a submission note is required.");

            RuleFor(x => x.Note)
                .MaximumLength(2000).WithMessage("Note cannot exceed 2000 characters.")
                .When(x => x.Note != null);

            RuleForEach(x => x.FileIds)
                .NotEmpty().WithMessage("File ID cannot be empty.")
                .When(x => x.FileIds.Any());
        }
    }
}
