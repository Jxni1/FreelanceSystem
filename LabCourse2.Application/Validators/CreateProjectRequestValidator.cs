using FluentValidation;
using LabCourse2.Application.DTOs.Projects;

namespace LabCourse2.Application.Validators
{
    public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
    {
        private static readonly string[] ValidStatuses = { "open", "in_progress", "completed", "cancelled" };
        private static readonly string[] ValidVisibilities = { "public", "private" };

        public CreateProjectRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required")
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");

            RuleFor(x => x.Budget)
                .GreaterThan(0).WithMessage("Budget must be greater than 0");

            RuleFor(x => x.ClientID)
                .NotEmpty().WithMessage("ClientID is required");

            RuleFor(x => x.CategoryID)
                .NotEmpty().WithMessage("CategoryID is required");

            RuleFor(x => x.Visibility)
                .NotEmpty().WithMessage("Visibility is required")
                .Must(v => ValidVisibilities.Contains(v))
                .WithMessage($"Visibility must be one of: {string.Join(", ", ValidVisibilities)}");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required")
                .Must(s => ValidStatuses.Contains(s))
                .WithMessage($"Status must be one of: {string.Join(", ", ValidStatuses)}");
        }
    }
}
