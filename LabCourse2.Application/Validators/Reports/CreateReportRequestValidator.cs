using FluentValidation;
using LabCourse2.Application.DTOs.Reports;

namespace LabCourse2.Application.Validators.Reports
{
    public class CreateReportRequestValidator : AbstractValidator<CreateReportRequest>
    {
        public CreateReportRequestValidator()
        {
            RuleFor(x => x.Entity)
                .NotEmpty()
                .Must(x => new[] { "Freelancer", "Client", "Skill", "Project", "Proposal", "Review", "File" }.Contains(x))
                .WithMessage("Entity must be one of: Freelancer, Client, Skill, Project, Proposal, Review, File.");

            RuleFor(x => x.EntityID)
                .NotEmpty()
                .WithMessage("EntityID is required.");

            RuleFor(x => x.Reason)
                .NotEmpty()
                .MaximumLength(500);
        }
    }
}