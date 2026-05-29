using FluentValidation;
using LabCourse2.Application.DTOs.Milestones;

namespace LabCourse2.Application.Validators.Milestones
{
    public class FundMilestoneRequestValidator : AbstractValidator<FundMilestoneRequest>
    {
        public FundMilestoneRequestValidator()
        {
            RuleFor(x => x.PaymentMethod)
                .MaximumLength(50).WithMessage("Payment method cannot exceed 50 characters.");
        }
    }
}
