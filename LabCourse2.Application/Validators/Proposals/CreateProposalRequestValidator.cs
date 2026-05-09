using FluentValidation;
using LabCourse2.Application.DTOs.Proposals;

namespace LabCourse2.Application.Validators.Proposals
{
    public class CreateProposalRequestValidator : AbstractValidator<CreateProposalRequest>
    {
        public CreateProposalRequestValidator()
        {
            RuleFor(x => x.ProjectId)
                .NotEmpty().WithMessage("Project ID is required.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required.")
                .MaximumLength(2000).WithMessage("Message cannot exceed 2000 characters.");

            RuleFor(x => x.BidAmount)
                .GreaterThan(0).WithMessage("Bid amount must be greater than 0.");

            RuleFor(x => x.DeliveryDays)
                .GreaterThan(0).WithMessage("Delivery days must be at least 1.");
        }
    }
}
