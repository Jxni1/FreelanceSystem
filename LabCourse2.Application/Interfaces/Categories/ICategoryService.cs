using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Categories;

namespace LabCourse2.Application.Interfaces.Categories
{
    public interface ICategoryService
    {
        Task<Result<PagedResult<CategoryResponse>>> GetAllAsync(CategoryQueryParams query);
        Task<Result<CategoryResponse>> GetByIdAsync(Guid id);
        Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request);
        Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}