using FluentValidation;
using LabCourse2.Application.DTOs.Skills;

namespace LabCourse2.Application.Validators.Skills
{
    public class CreateSkillRequestValidator : AbstractValidator<CreateSkillRequest>
    {
        public CreateSkillRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Skill name is required.")
                .MaximumLength(255).WithMessage("Skill name cannot exceed 255 characters.");
        }
    }
}