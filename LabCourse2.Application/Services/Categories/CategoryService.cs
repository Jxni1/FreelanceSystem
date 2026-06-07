using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Categories;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Categories;
using LabCourse2.Application.Mappings;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Categories
{
    public class CategoryService : ICategoryService
    {
        private readonly IAppDbContext _context;
        private readonly ICacheService _cacheService;

        public CategoryService(IAppDbContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<Result<PagedResult<CategoryResponse>>> GetAllAsync(CategoryQueryParams query)
        {
            var search = query.Search ?? "null";
            var cacheKey = $"categories_all_{query.Page}_{query.PageSize}_{search}";
            
            var cached = await _cacheService.GetAsync<PagedResult<CategoryResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<CategoryResponse>>.Success(cached);

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

            var result = new PagedResult<CategoryResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromHours(2));

            return Result<PagedResult<CategoryResponse>>.Success(result);
        }

        public async Task<Result<CategoryResponse>> GetByIdAsync(Guid id)
        {
            var cacheKey = $"category_{id}";
            
            var cached = await _cacheService.GetAsync<CategoryResponse>(cacheKey);
            if (cached != null)
                return Result<CategoryResponse>.Success(cached);

            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category is null)
                return Result<CategoryResponse>.NotFound($"Category with ID {id} was not found.");

            var response = category.ToResponse();
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(2));

            return Result<CategoryResponse>.Success(response);
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

            await _cacheService.RemoveByPatternAsync("categories_all_*");

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

            await _cacheService.RemoveByPatternAsync("categories_all_*");
            await _cacheService.RemoveAsync($"category_{id}");

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

            await _cacheService.RemoveByPatternAsync("categories_all_*");
            await _cacheService.RemoveAsync($"category_{id}");

            return Result<bool>.Success(true);
        }
    }
}
