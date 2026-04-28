using FluentValidation;
using LabCourse2.Application.DTOs.Categories;

namespace LabCourse2.Application.Validators.Categories
{
    public class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
    {
        public UpdateCategoryRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Category name is required.")
                .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

            RuleFor(x => x.Photo)
                .MaximumLength(500).WithMessage("Photo URL cannot exceed 500 characters.");
        }
    }
}
