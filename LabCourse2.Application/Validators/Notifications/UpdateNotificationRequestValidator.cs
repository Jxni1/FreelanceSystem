using FluentValidation;
using LabCourse2.Application.DTOs.Notifications;

namespace LabCourse2.Application.Validators.Notifications
{
    public class UpdateNotificationRequestValidator : AbstractValidator<UpdateNotificationRequest>
    {
        public UpdateNotificationRequestValidator()
        {
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Type is required.")
                .MaximumLength(50).WithMessage("Type cannot exceed 50 characters.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(150).WithMessage("Title cannot exceed 150 characters.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required.")
                .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");
        }
    }
}