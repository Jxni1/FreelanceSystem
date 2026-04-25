using FluentValidation;
using LabCourse2.Application.DTOs.Deliverables;

namespace LabCourse2.Application.Validators.Deliverables
{
    public class CreateDeliverableRequestValidator : AbstractValidator<CreateDeliverableRequest>
    {
        public CreateDeliverableRequestValidator()
        {
            RuleFor(x => x.MilestoneID)
                .NotEmpty().WithMessage("MilestoneID is required.");

            RuleFor(x => x.FileID)
                .NotEmpty().WithMessage("FileID is required.");
        }
    }
}
