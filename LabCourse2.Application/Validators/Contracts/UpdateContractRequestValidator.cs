using FluentValidation;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Domain.Constants;

namespace LabCourse2.Application.Validators.Contracts
{
    public class UpdateContractRequestValidator : AbstractValidator<UpdateContractRequest>
    {
        public UpdateContractRequestValidator()
        {
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

            RuleFor(x => x.Start_Date)
                .NotEmpty().WithMessage("Start date is required.")
                .LessThan(x => x.End_Date).WithMessage("Start date must be before end date.");

            RuleFor(x => x.End_Date)
                .NotEmpty().WithMessage("End date is required.");

            RuleFor(x => x.Agreed_Price)
                .GreaterThan(0).WithMessage("Agreed price must be greater than 0.");

            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(s => ContractStatus.All.Contains(s))
                .WithMessage($"Status must be one of: {string.Join(", ", ContractStatus.All)}.");
        }
    }
}
