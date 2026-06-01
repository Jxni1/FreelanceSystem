using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Skills;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Skills;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Skills
{
    public class SkillService : ISkillService
    {
        private readonly IAppDbContext _context;
        private readonly ICacheService _cacheService;

        public SkillService(IAppDbContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<Result<PagedResult<SkillResponse>>> GetAllAsync(SkillQueryParams query)
        {
            var search = query.Search ?? "null";
            var cacheKey = $"skills_all_{query.Page}_{query.PageSize}_{search}";
            
            var cached = await _cacheService.GetAsync<PagedResult<SkillResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<SkillResponse>>.Success(cached);

            var q = _context.Skills.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(s => s.Name.Contains(query.Search));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(s => s.Name)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(s => s.ToResponse())
                .ToListAsync();

            var result = new PagedResult<SkillResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromHours(2));

            return Result<PagedResult<SkillResponse>>.Success(result);
        }

        public async Task<Result<SkillResponse>> GetByIdAsync(Guid id)
        {
            var cacheKey = $"skill_{id}";
            
            var cached = await _cacheService.GetAsync<SkillResponse>(cacheKey);
            if (cached != null)
                return Result<SkillResponse>.Success(cached);

            var skill = await _context.Skills
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SkillsID == id);

            if (skill is null)
                return Result<SkillResponse>.NotFound($"Skill with ID {id} was not found.");

            var response = skill.ToResponse();
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(2));

            return Result<SkillResponse>.Success(response);
        }

        public async Task<Result<SkillResponse>> CreateAsync(CreateSkillRequest request)
        {
            var skill = request.ToEntity();

            await _context.Skills.AddAsync(skill);
            await _context.SaveChangesAsync();

            var created = await _context.Skills
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SkillsID == skill.SkillsID);

            await _cacheService.RemoveAsync("skills_all");

            return Result<SkillResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<SkillResponse>> UpdateAsync(Guid id, UpdateSkillRequest request)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.SkillsID == id);

            if (skill is null)
                return Result<SkillResponse>.NotFound($"Skill with ID {id} was not found.");

            skill.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            var updated = await _context.Skills
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SkillsID == skill.SkillsID);

            await _cacheService.RemoveAsync("skills_all");
            await _cacheService.RemoveAsync($"skill_{id}");

            return Result<SkillResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.SkillsID == id);

            if (skill is null)
                return Result<bool>.NotFound($"Skill with ID {id} was not found.");

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();

            await _cacheService.RemoveAsync("skills_all");
            await _cacheService.RemoveAsync($"skill_{id}");

            return Result<bool>.Success(true);
        }
    }
}