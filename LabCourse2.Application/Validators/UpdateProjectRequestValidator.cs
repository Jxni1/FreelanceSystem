using FluentValidation;
using LabCourse2.Application.DTOs.Projects;

namespace LabCourse2.Application.Validators
{
    public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
    {
        private static readonly string[] ValidStatuses = { "open", "in_progress", "completed", "cancelled" };
        private static readonly string[] ValidVisibilities = { "public", "private" };

        public UpdateProjectRequestValidator()
        {
            When(x => x.Title != null, () =>
            {
                RuleFor(x => x.Title)
                    .NotEmpty().WithMessage("Title cannot be empty")
                    .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");
            });

            When(x => x.Description != null, () =>
            {
                RuleFor(x => x.Description)
                    .NotEmpty().WithMessage("Description cannot be empty")
                    .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");
            });

            When(x => x.Budget != null, () =>
            {
                RuleFor(x => x.Budget)
                    .GreaterThan(0).WithMessage("Budget must be greater than 0");
            });

            When(x => x.CategoryID != null, () =>
            {
                RuleFor(x => x.CategoryID)
                    .NotEmpty().WithMessage("CategoryID cannot be empty");
            });

            When(x => x.Visibility != null, () =>
            {
                RuleFor(x => x.Visibility)
                    .NotEmpty().WithMessage("Visibility cannot be empty")
                    .Must(v => ValidVisibilities.Contains(v!))
                    .WithMessage($"Visibility must be one of: {string.Join(", ", ValidVisibilities)}");
            });

            When(x => x.Status != null, () =>
            {
                RuleFor(x => x.Status)
                    .NotEmpty().WithMessage("Status cannot be empty")
                    .Must(s => ValidStatuses.Contains(s!))
                    .WithMessage($"Status must be one of: {string.Join(", ", ValidStatuses)}");
            });
        }
    }
}
