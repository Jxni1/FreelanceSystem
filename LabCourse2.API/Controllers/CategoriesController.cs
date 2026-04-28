using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CategoriesController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all categories (No auth required)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllCategories(CancellationToken cancellationToken)
        {
            var categories = await _db.Categories
                .Select(c => new { c.CategoryID, c.Name, c.Description })
                .ToListAsync(cancellationToken);

            return Ok(categories);
        }

        /// <summary>
        /// Create a category (Requires JWT)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Name is required." });

            var exists = await _db.Categories.AnyAsync(c => c.Name == request.Name.Trim(), cancellationToken);
            if (exists)
                return Conflict(new { message = "A category with that name already exists." });

            var category = new Category
            {
                CategoryID = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? string.Empty,
                Photo = string.Empty,
            };

            _db.Categories.Add(category);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetAllCategories), new { category.CategoryID, category.Name, category.Description });
        }
    }

    public record CreateCategoryRequest(string Name, string? Description);
}
