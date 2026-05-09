using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Freelancers;
using LabCourse2.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services
{
    public class FreelancerService : IFreelancerService
    {
        private readonly IAppDbContext _context;

        public FreelancerService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<FreelancerResponse>>> GetAllAsync(FreelancerQueryParams query)
        {
            var q = _context.FreelancerProfiles
                .Include(fp => fp.User)
                .Include(fp => fp.Reviews)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(fp =>
                    fp.User.Name.Contains(query.Search) ||
                    fp.User.Username.Contains(query.Search));

            if (!string.IsNullOrWhiteSpace(query.ExperienceLevel))
                q = q.Where(fp => fp.Experience_Level == query.ExperienceLevel);

            if (!string.IsNullOrWhiteSpace(query.Skill))
                q = q.Where(fp => _context.FreelancerSkills
                    .Any(fs => fs.FreelancerID == fp.FreelancerID &&
                               fs.Skill.Name.Contains(query.Skill)));

            var totalCount = await q.CountAsync();

            var rawItems = await q
                .OrderBy(fp => fp.User.Name)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var freelancerIds = rawItems.Select(fp => fp.FreelancerID).ToList();
            var skillEntries = await _context.FreelancerSkills
                .Where(fs => freelancerIds.Contains(fs.FreelancerID))
                .Select(fs => new { fs.FreelancerID, fs.Skill.Name })
                .ToListAsync();

            var skillsMap = skillEntries
                .GroupBy(x => x.FreelancerID)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Name).ToList());

            var items = rawItems.Select(fp => new FreelancerResponse
            {
                FreelancerID = fp.FreelancerID,
                Name = $"{fp.User.Name} {fp.User.Surname}".Trim(),
                Username = fp.User.Username,
                ExperienceLevel = fp.Experience_Level,
                HourlyRate = fp.Hourly_Rate,
                Skills = skillsMap.GetValueOrDefault(fp.FreelancerID) ?? new List<string>(),
                ReviewCount = fp.Reviews.Count,
                AverageRating = fp.Reviews.Count > 0
                    ? Math.Round(fp.Reviews.Average(r => r.Rating), 1)
                    : 0
            }).ToList();

            return Result<PagedResult<FreelancerResponse>>.Success(new PagedResult<FreelancerResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }
    }
}
