using FluentValidation;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Domain.Constants;

namespace LabCourse2.Application.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100);

            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Surname is required.")
                .MaximumLength(100);

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required.")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
                .MaximumLength(50)
                .Matches("^[a-zA-Z0-9_.-]+$").WithMessage("Username may only contain letters, digits, underscores, hyphens, and dots.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email address is required.")
                .MaximumLength(256);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(72).WithMessage("Password must not exceed 72 characters.") 
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required.")
                .Must(r => RoleConstants.AllRoles.Contains(r))
                .WithMessage($"Role must be one of: {string.Join(", ", RoleConstants.AllRoles)}.");

            When(x => x.Role == RoleConstants.Freelancer, () =>
            {
                RuleFor(x => x.ExperienceLevel)
                    .NotEmpty().WithMessage("ExperienceLevel is required for Freelancers.")
                    .Must(v => new[] { "Junior", "Mid", "Senior", "Expert" }.Contains(v))
                    .WithMessage("ExperienceLevel must be one of: Junior, Mid, Senior, Expert.");

                RuleFor(x => x.HourlyRate)
                    .NotNull().WithMessage("HourlyRate is required for Freelancers.")
                    .GreaterThan(0).WithMessage("HourlyRate must be greater than 0.");
            });

            When(x => x.Role == RoleConstants.Client, () =>
            {
                RuleFor(x => x.Bio)
                    .NotEmpty().WithMessage("Bio is required for Clients.")
                    .MaximumLength(1000);

                RuleFor(x => x.Industry)
                    .NotEmpty().WithMessage("Industry is required for Clients.")
                    .MaximumLength(100);

                RuleFor(x => x.Budget)
                    .NotNull().WithMessage("Budget is required for Clients.")
                    .GreaterThanOrEqualTo(0).WithMessage("Budget must be non-negative.");
            });
        }
    }
}
