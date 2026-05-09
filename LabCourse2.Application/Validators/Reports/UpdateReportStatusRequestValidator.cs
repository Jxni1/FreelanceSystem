using FluentValidation;
using LabCourse2.Application.DTOs.Reports;

namespace LabCourse2.Application.Validators.Reports
{
    public class UpdateReportStatusRequestValidator : AbstractValidator<UpdateReportStatusRequest>
    {
        public UpdateReportStatusRequestValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(x => new[] { "Pending", "Reviewed", "Resolved", "Rejected" }.Contains(x))
                .WithMessage("Status must be one of: Pending, Reviewed, Resolved, Rejected.");
        }
    }
}