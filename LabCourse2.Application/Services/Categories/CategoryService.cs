using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Categories;
using LabCourse2.Application.Interfaces.Categories;
using LabCourse2.Application.Mappings;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Categories
{
    public class CategoryService : ICategoryService
    {
        private readonly IAppDbContext _context;

        public CategoryService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<CategoryResponse>>> GetAllAsync(CategoryQueryParams query)
        {
            var q = _context.Categories.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(c => c.Name.Contains(query.Search));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(c => c.Name)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            return Result<PagedResult<CategoryResponse>>.Success(new PagedResult<CategoryResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<CategoryResponse>> GetByIdAsync(Guid id)
        {
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category is null)
                return Result<CategoryResponse>.NotFound($"Category with ID {id} was not found.");

            return Result<CategoryResponse>.Success(category.ToResponse());
        }

        public async Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request)
        {
            var exists = await _context.Categories.AnyAsync(c => c.Name == request.Name);
            if (exists)
                return Result<CategoryResponse>.Conflict("A category with this name already exists.");

            var category = request.ToEntity();
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            var created = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoryID == category.CategoryID);

            return Result<CategoryResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category is null)
                return Result<CategoryResponse>.NotFound($"Category with ID {id} was not found.");

            var nameExists = await _context.Categories
                .AnyAsync(c => c.Name == request.Name && c.CategoryID != id);
            if (nameExists)
                return Result<CategoryResponse>.Conflict("A category with this name already exists.");

            category.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            var updated = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            return Result<CategoryResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category is null)
                return Result<bool>.NotFound($"Category with ID {id} was not found.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}