using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Skills;
using LabCourse2.Application.Interfaces.Skills;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Skills
{
    public class SkillService : ISkillService
    {
        private readonly IAppDbContext _context;

        public SkillService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<SkillResponse>>> GetAllAsync(SkillQueryParams query)
        {
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

            return Result<PagedResult<SkillResponse>>.Success(new PagedResult<SkillResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<SkillResponse>> GetByIdAsync(Guid id)
        {
            var skill = await _context.Skills
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SkillsID == id);

            if (skill is null)
                return Result<SkillResponse>.NotFound($"Skill with ID {id} was not found.");

            return Result<SkillResponse>.Success(skill.ToResponse());
        }

        public async Task<Result<SkillResponse>> CreateAsync(CreateSkillRequest request)
        {
            var skill = request.ToEntity();

            await _context.Skills.AddAsync(skill);
            await _context.SaveChangesAsync();

            var created = await _context.Skills
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SkillsID == skill.SkillsID);

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

            return Result<bool>.Success(true);
        }
    }
}