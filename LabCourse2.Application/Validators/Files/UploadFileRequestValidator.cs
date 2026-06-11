using FluentValidation;
using LabCourse2.Application.DTOs.Files;

namespace LabCourse2.Application.Validators.Files
{
    public class UploadFileRequestValidator : AbstractValidator<UploadFileRequest>
    {
        private static readonly string[] AllowedEntities =
        {
            "Project",
            "Contract",
            "Report",
            "User",
            "Milestone"
        };

        private static readonly string[] AllowedExtensions =
        {
            ".pdf",
            ".doc",
            ".docx",
            ".png",
            ".jpg",
            ".jpeg"
        };

        public UploadFileRequestValidator()
        {
            RuleFor(x => x.Entity)
                .NotEmpty().WithMessage("Entity is required.")
                .Must(entity => AllowedEntities.Contains(entity, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"Entity must be one of: {string.Join(", ", AllowedEntities)}.");

            RuleFor(x => x.EntityID)
                .NotEmpty().WithMessage("EntityID is required.");

            RuleFor(x => x.File)
                .NotNull().WithMessage("File is required.")
                .Must(file => file != null && file.Length > 0)
                .WithMessage("File cannot be empty.")
                .Must(file => file == null || file.Length <= 10 * 1024 * 1024)
                .WithMessage("File size cannot exceed 10 MB.")
                .Must(file =>
                {
                    if (file == null) return false;
                    var extension = Path.GetExtension(file.FileName);
                    return AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase);
                })
                .WithMessage($"File type must be one of: {string.Join(", ", AllowedExtensions)}.");
        }
    }
}