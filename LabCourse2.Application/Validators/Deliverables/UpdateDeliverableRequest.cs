
using FluentValidation;
using LabCourse2.Application.DTOs.Deliverables;

namespace LabCourse2.Application.Validators.Deliverables
{
    public class UpdateDeliverableRequestValidator : AbstractValidator<UpdateDeliverableRequest>
    {
        public UpdateDeliverableRequestValidator()
        {
            RuleFor(x => x.FileID)
                .NotEmpty().WithMessage("FileID is required.");
        }
    }
}
