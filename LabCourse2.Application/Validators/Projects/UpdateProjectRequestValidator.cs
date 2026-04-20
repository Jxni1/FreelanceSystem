using FluentValidation;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Domain.Constants;

namespace LabCourse2.Application.Validators.Projects
{
    public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
    {
        public UpdateProjectRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(150).WithMessage("Title cannot exceed 150 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

            RuleFor(x => x.Budget)
                .GreaterThan(0).WithMessage("Budget must be greater than 0.");

            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(s => ProjectStatus.All.Contains(s))
                .WithMessage($"Status must be one of: {string.Join(", ", ProjectStatus.All)}.");

            RuleFor(x => x.Visibility)
                .NotEmpty()
                .Must(v => ProjectVisibility.All.Contains(v))
                .WithMessage($"Visibility must be one of: {string.Join(", ", ProjectVisibility.All)}.");

            RuleFor(x => x.CategoryID)
                .NotEmpty().WithMessage("CategoryID is required.");
        }
    }
}