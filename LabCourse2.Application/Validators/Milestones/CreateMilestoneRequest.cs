
using FluentValidation;
using LabCourse2.Application.DTOs.Milestones;

namespace LabCourse2.Application.Validators.Milestones
{
    public class CreateMilestoneRequestValidator : AbstractValidator<CreateMilestoneRequest>
    {
        public CreateMilestoneRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(150).WithMessage("Title cannot exceed 150 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0.");

            RuleFor(x => x.DueDate)
                .GreaterThan(DateTime.UtcNow).WithMessage("Due date must be in the future.");

            RuleFor(x => x.ContractID)
                .NotEmpty().WithMessage("ContractID is required.");
        }
    }
}
