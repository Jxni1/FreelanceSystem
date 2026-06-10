using CsvHelper;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Categories;
using LabCourse2.Application.DTOs.Users;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Categories;
using LabCourse2.Application.Mappings;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using System.Text;
using System.Text.Json;

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

        public async Task<Result<FileExportResultDto>> ExportCategoriesAsync(CategoryQueryParams query, string format)
        {
            format = (format ?? "csv").Trim().ToLowerInvariant();

            var q = _context.Categories
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(c => c.Name.Contains(query.Search));

            var items = await q
                .OrderBy(c => c.Name)
                .Select(c => new CategoryExportDto
                {
                    CategoryId = c.CategoryID,
                    Name = c.Name,
                    Description = c.Description,
                })
                .ToListAsync();

            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

            if (format == "csv")
            {
                using var ms = new MemoryStream();
                using (var writer = new StreamWriter(ms, Encoding.UTF8, leaveOpen: true))
                using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
                {
                    csv.WriteRecords(items);
                }

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = ms.ToArray(),
                    ContentType = "text/csv",
                    FileName = $"categories_{timestamp}.csv"
                });
            }

            if (format == "json")
            {
                var bytes = JsonSerializer.SerializeToUtf8Bytes(items, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = bytes,
                    ContentType = "application/json",
                    FileName = $"categories_{timestamp}.json"
                });
            }

            if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Categories");

                sheet.Cells[1, 1].Value = "CategoryId";
                sheet.Cells[1, 2].Value = "Name";
                sheet.Cells[1, 3].Value = "Description";

                for (int i = 0; i < items.Count; i++)
                {
                    var row = i + 2;
                    var item = items[i];

                    sheet.Cells[row, 1].Value = item.CategoryId.ToString();
                    sheet.Cells[row, 2].Value = item.Name;
                    sheet.Cells[row, 3].Value = item.Description;
                }

                sheet.Cells.AutoFitColumns();

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = package.GetAsByteArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"categories_{timestamp}.xlsx"
                });
            }

            return Result<FileExportResultDto>.Failure("Unsupported export format. Use csv, excel, or json.");
        }

        public async Task<Result<ImportResultDto>> ImportCategoriesAsync(IFormFile file, string format)
        {
            if (file == null || file.Length == 0)
                return Result<ImportResultDto>.Failure("No file was uploaded.");

            format = (format ?? "csv").Trim().ToLowerInvariant();

            List<CategoryImportDto> items;

            try
            {
                if (format == "csv")
                {
                    using var stream = file.OpenReadStream();
                    using var reader = new StreamReader(stream);
                    using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

                    items = csv.GetRecords<CategoryImportDto>().ToList();
                }
                else if (format == "json")
                {
                    using var stream = file.OpenReadStream();
                    items = await JsonSerializer.DeserializeAsync<List<CategoryImportDto>>(stream,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }) ?? new List<CategoryImportDto>();
                }
                else if (format == "excel" || format == "xlsx")
                {
                    ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                    using var stream = file.OpenReadStream();
                    using var package = new ExcelPackage(stream);
                    var sheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (sheet == null || sheet.Dimension == null)
                        return Result<ImportResultDto>.Failure("The Excel file is empty.");

                    items = new List<CategoryImportDto>();

                    // Export writes: 1 = CategoryId, 2 = Name, 3 = Description
                    for (int row = 2; row <= sheet.Dimension.End.Row; row++)
                    {
                        var nameValue = sheet.Cells[row, 2].Text?.Trim();
                        var descriptionValue = sheet.Cells[row, 3].Text?.Trim();

                        items.Add(new CategoryImportDto
                        {
                            Name = nameValue ?? string.Empty,
                            Description = descriptionValue ?? string.Empty,
                        });
                    }
                }
                else
                {
                    return Result<ImportResultDto>.Failure("Unsupported import format. Use csv, excel, or json.");
                }
            }
            catch (Exception ex)
            {
                return Result<ImportResultDto>.Failure($"Failed to read import file: {ex.Message}");
            }

            var result = new ImportResultDto
            {
                TotalRows = items.Count
            };

            foreach (var item in items)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(item.Name))
                    {
                        result.FailedRows++;
                        result.Errors.Add("Name is required.");
                        continue;
                    }

                    var trimmedName = item.Name.Trim();

                    var exists = await _context.Categories.AnyAsync(c => c.Name == trimmedName);
                    if (exists)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Category with name '{trimmedName}' already exists.");
                        continue;
                    }

                    var category = new Domain.Entities.Category
                    {
                        CategoryID = Guid.NewGuid(),
                        Name = trimmedName,
                        Description = item.Description?.Trim() ?? string.Empty,
                    };

                    await _context.Categories.AddAsync(category);
                    result.ImportedRows++;
                }
                catch (Exception ex)
                {
                    result.FailedRows++;
                    result.Errors.Add(ex.Message);
                }
            }

            await _context.SaveChangesAsync();
            await _cacheService.RemoveByPatternAsync("categories_all_*");

            return Result<ImportResultDto>.Success(result);
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