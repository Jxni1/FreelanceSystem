using FluentValidation;
using LabCourse2.Application.DTOs.Users;

namespace LabCourse2.Application.Validators.Users
{
    public class DeleteUserRequestValidator : AbstractValidator<DeleteUserRequest>
    {
        public DeleteUserRequestValidator()
        {
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.");
        }
    }
}