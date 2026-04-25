using FluentValidation;
using LabCourse2.Application.DTOs.Skills;

namespace LabCourse2.Application.Validators.Skills
{
    public class UpdateSkillRequestValidator : AbstractValidator<UpdateSkillRequest>
    {
        public UpdateSkillRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Skill name is required.")
                .MaximumLength(255).WithMessage("Skill name cannot exceed 255 characters.");
        }
    }
}