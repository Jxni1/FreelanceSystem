using LabCourse2.Application.DTOs.Categories;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class CategoryMappingExtensions
    {
        public static CategoryResponse ToResponse(this Category category) =>
            new()
            {
                CategoryID = category.CategoryID,
                Name = category.Name,
                Description = category.Description,
                Photo = category.Photo
            };

        public static Category ToEntity(this CreateCategoryRequest request) =>
            new()
            {
                CategoryID = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo
            };

        public static void ApplyUpdate(this Category category, UpdateCategoryRequest request)
        {
            category.Name = request.Name;
            category.Description = request.Description;
            category.Photo = request.Photo;
        }
    }
}
