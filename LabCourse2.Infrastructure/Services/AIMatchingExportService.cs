using System.Globalization;
using System.Text;
using LabCourse2.Application.DTOs.AI;
using LabCourse2.Application.Interfaces.AI;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public class AIMatchingExportService : IAIMatchingExportService
    {
        private readonly AppDbContext _context;

        public AIMatchingExportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> ExportFreelancersCsvAsync()
        {
            var freelancers = await _context.FreelancerProfiles
                .AsNoTracking()
                .ToListAsync();

            var freelancerSkills = await _context.FreelancerSkills
                .AsNoTracking()
                .Include(fs => fs.Skill)
                .ToListAsync();

            var rows = freelancers.Select(f =>
            {
                var skills = freelancerSkills
                    .Where(fs => fs.FreelancerID == f.FreelancerID)
                    .ToList();

                var skillNames = skills
                    .Select(s => s.Skill.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var skillLevels = skills
                    .Select(s => $"{s.Skill.Name}:{s.Level}")
                    .ToList();

                var freelancerText =
                    $"Experience level: {f.Experience_Level}. " +
                    $"Hourly rate: {f.Hourly_Rate}. " +
                    $"Skills: {string.Join(", ", skillNames)}. " +
                    $"Skill levels: {string.Join(", ", skillLevels)}.";

                return new FreelancerExportRow
                {
                    FreelancerId = f.FreelancerID,
                    UserId = f.UserID,
                    ExperienceLevel = f.Experience_Level,
                    HourlyRate = f.Hourly_Rate,
                    SkillsText = string.Join(", ", skillNames),
                    SkillLevelsText = string.Join(", ", skillLevels),
                    FreelancerText = freelancerText
                };
            }).ToList();

            return BuildCsv(
                rows,
                new[]
                {
                    "FreelancerId","UserId","ExperienceLevel","HourlyRate",
                    "SkillsText","SkillLevelsText","FreelancerText"
                },
                row => new[]
                {
                    row.FreelancerId.ToString(),
                    row.UserId.ToString(),
                    row.ExperienceLevel,
                    row.HourlyRate.ToString(CultureInfo.InvariantCulture),
                    row.SkillsText,
                    row.SkillLevelsText,
                    row.FreelancerText
                });
        }

        public async Task<byte[]> ExportProjectsCsvAsync()
        {
            var projects = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Category)
                .ToListAsync();

            var projectSkills = await _context.ProjectSkills
                .AsNoTracking()
                .Include(ps => ps.Skill)
                .ToListAsync();

            var rows = projects.Select(p =>
            {
                var skills = projectSkills
                    .Where(ps => ps.ProjectID == p.ProjectID)
                    .Select(ps => ps.Skill.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var projectText =
                    $"Title: {p.Title}. " +
                    $"Description: {p.Description}. " +
                    $"Category: {p.Category.Name}. " +
                    $"Budget: {p.Budget}. " +
                    $"Skills: {string.Join(", ", skills)}.";

                return new ProjectExportRow
                {
                    ProjectId = p.ProjectID,
                    ClientId = p.ClientID,
                    CategoryId = p.CategoryID,
                    CategoryName = p.Category.Name,
                    Title = p.Title,
                    Description = p.Description,
                    Budget = p.Budget,
                    Status = p.Status,
                    Visibility = p.Visibility,
                    CreatedAt = p.CreatedAt,
                    SkillsText = string.Join(", ", skills),
                    ProjectText = projectText
                };
            }).ToList();

            return BuildCsv(
                rows,
                new[]
                {
                    "ProjectId","ClientId","CategoryId","CategoryName","Title","Description",
                    "Budget","Status","Visibility","CreatedAt","SkillsText","ProjectText"
                },
                row => new[]
                {
                    row.ProjectId.ToString(),
                    row.ClientId.ToString(),
                    row.CategoryId.ToString(),
                    row.CategoryName,
                    row.Title,
                    row.Description,
                    row.Budget.ToString(CultureInfo.InvariantCulture),
                    row.Status,
                    row.Visibility,
                    row.CreatedAt.ToString("o"),
                    row.SkillsText,
                    row.ProjectText
                });
        }

        public async Task<byte[]> ExportPositivePairsCsvAsync()
        {
            var contracts = await _context.Contracts
                .AsNoTracking()
                .Include(c => c.Proposal)
                .ToListAsync();

            var rows = contracts.Select(c => new PositivePairExportRow
            {
                FreelancerId = c.FreelancerID,
                ProjectId = c.ProjectID,
                ProposalId = c.ProposalID,
                ContractId = c.ContractID,
                BidAmount = c.Proposal?.BidAmount,
                DeliveryDays = c.Proposal?.DeliveryDays,
                ProposalStatus = c.Proposal?.Status ?? string.Empty,
                ContractStatus = c.Status,
                LabelSource = "contract",
                Label = 1
            }).ToList();

            return BuildCsv(
                rows,
                new[]
                {
                    "FreelancerId","ProjectId","ProposalId","ContractId",
                    "BidAmount","DeliveryDays","ProposalStatus","ContractStatus",
                    "LabelSource","Label"
                },
                row => new[]
                {
                    row.FreelancerId.ToString(),
                    row.ProjectId.ToString(),
                    row.ProposalId?.ToString() ?? "",
                    row.ContractId.ToString(),
                    row.BidAmount?.ToString(CultureInfo.InvariantCulture) ?? "",
                    row.DeliveryDays?.ToString() ?? "",
                    row.ProposalStatus,
                    row.ContractStatus,
                    row.LabelSource,
                    row.Label.ToString()
                });
        }

        public async Task<byte[]> ExportMatchingTrainingCsvAsync()
        {
            var freelancers = await _context.FreelancerProfiles
                .AsNoTracking()
                .ToListAsync();

            var freelancerSkills = await _context.FreelancerSkills
                .AsNoTracking()
                .Include(fs => fs.Skill)
                .ToListAsync();

            var projects = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Category)
                .ToListAsync();

            var projectSkills = await _context.ProjectSkills
                .AsNoTracking()
                .Include(ps => ps.Skill)
                .ToListAsync();

            var contracts = await _context.Contracts
                .AsNoTracking()
                .Include(c => c.Proposal)
                .ToListAsync();

            var positivePairSet = contracts
                .Select(c => $"{c.FreelancerID}_{c.ProjectID}")
                .ToHashSet();

            var rows = new List<MatchingTrainingRow>();

            foreach (var contract in contracts)
            {
                var freelancer = freelancers.FirstOrDefault(f => f.FreelancerID == contract.FreelancerID);
                var project = projects.FirstOrDefault(p => p.ProjectID == contract.ProjectID);

                if (freelancer == null || project == null)
                    continue;

                var fSkills = freelancerSkills
                    .Where(fs => fs.FreelancerID == freelancer.FreelancerID)
                    .ToList();

                var pSkills = projectSkills
                    .Where(ps => ps.ProjectID == project.ProjectID)
                    .ToList();

                var fSkillNames = fSkills
                    .Select(x => x.Skill.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var pSkillNames = pSkills
                    .Select(x => x.Skill.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var overlapCount = pSkillNames.Count == 0
                    ? 0
                    : pSkillNames.Count(skill => fSkillNames.Contains(skill, StringComparer.OrdinalIgnoreCase));

                var skillOverlap = pSkillNames.Count == 0
                    ? 0
                    : (double)overlapCount / pSkillNames.Count;

                double MapLevel(string level) => level.Trim().ToLower() switch
                {
                    "beginner" => 0.4,
                    "intermediate" => 0.7,
                    "advanced" => 1.0,
                    "junior" => 0.4,
                    "mid" => 0.7,
                    "senior" => 1.0,
                    _ => 0.5
                };

                var skillLevelScore = fSkills.Count == 0
                    ? 0
                    : fSkills.Average(x => MapLevel(x.Level));

                var freelancerText =
                    $"Experience level: {freelancer.Experience_Level}. " +
                    $"Hourly rate: {freelancer.Hourly_Rate}. " +
                    $"Skills: {string.Join(", ", fSkillNames)}. " +
                    $"Skill levels: {string.Join(", ", fSkills.Select(x => $"{x.Skill.Name}:{x.Level}"))}.";

                var projectText =
                    $"Title: {project.Title}. " +
                    $"Description: {project.Description}. " +
                    $"Category: {project.Category.Name}. " +
                    $"Budget: {project.Budget}. " +
                    $"Skills: {string.Join(", ", pSkillNames)}.";

                rows.Add(new MatchingTrainingRow
                {
                    FreelancerId = freelancer.FreelancerID,
                    ProjectId = project.ProjectID,
                    FreelancerText = freelancerText,
                    ProjectText = projectText,
                    ExperienceLevel = freelancer.Experience_Level,
                    HourlyRate = freelancer.Hourly_Rate,
                    ProjectBudget = project.Budget,
                    CategoryMatch = 1,
                    SkillOverlap = skillOverlap,
                    SkillLevelScore = skillLevelScore,
                    ProposalBidRatio = contract.Proposal != null && project.Budget > 0
                        ? (double)(contract.Proposal.BidAmount / project.Budget)
                        : null,
                    DeliveryDays = contract.Proposal?.DeliveryDays,
                    Label = 1
                });

                var negativeProjects = projects
                    .Where(p =>
                        p.ProjectID != project.ProjectID &&
                        !positivePairSet.Contains($"{freelancer.FreelancerID}_{p.ProjectID}"))
                    .Take(2)
                    .ToList();

                foreach (var negativeProject in negativeProjects)
                {
                    var npSkills = projectSkills
                        .Where(ps => ps.ProjectID == negativeProject.ProjectID)
                        .ToList();

                    var npSkillNames = npSkills
                        .Select(x => x.Skill.Name)
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();

                    var negOverlapCount = npSkillNames.Count == 0
                        ? 0
                        : npSkillNames.Count(skill => fSkillNames.Contains(skill, StringComparer.OrdinalIgnoreCase));

                    var negSkillOverlap = npSkillNames.Count == 0
                        ? 0
                        : (double)negOverlapCount / npSkillNames.Count;

                    var negativeProjectText =
                        $"Title: {negativeProject.Title}. " +
                        $"Description: {negativeProject.Description}. " +
                        $"Category: {negativeProject.Category.Name}. " +
                        $"Budget: {negativeProject.Budget}. " +
                        $"Skills: {string.Join(", ", npSkillNames)}.";

                    rows.Add(new MatchingTrainingRow
                    {
                        FreelancerId = freelancer.FreelancerID,
                        ProjectId = negativeProject.ProjectID,
                        FreelancerText = freelancerText,
                        ProjectText = negativeProjectText,
                        ExperienceLevel = freelancer.Experience_Level,
                        HourlyRate = freelancer.Hourly_Rate,
                        ProjectBudget = negativeProject.Budget,
                        CategoryMatch = negativeProject.CategoryID == project.CategoryID ? 1 : 0,
                        SkillOverlap = negSkillOverlap,
                        SkillLevelScore = skillLevelScore,
                        ProposalBidRatio = null,
                        DeliveryDays = null,
                        Label = 0
                    });
                }
            }

            return BuildCsv(
                rows,
                new[]
                {
                    "FreelancerId","ProjectId","FreelancerText","ProjectText","ExperienceLevel",
                    "HourlyRate","ProjectBudget","CategoryMatch","SkillOverlap","SkillLevelScore",
                    "ProposalBidRatio","DeliveryDays","Label"
                },
                row => new[]
                {
                    row.FreelancerId.ToString(),
                    row.ProjectId.ToString(),
                    row.FreelancerText,
                    row.ProjectText,
                    row.ExperienceLevel,
                    row.HourlyRate.ToString(CultureInfo.InvariantCulture),
                    row.ProjectBudget.ToString(CultureInfo.InvariantCulture),
                    row.CategoryMatch.ToString(),
                    row.SkillOverlap.ToString(CultureInfo.InvariantCulture),
                    row.SkillLevelScore.ToString(CultureInfo.InvariantCulture),
                    row.ProposalBidRatio?.ToString(CultureInfo.InvariantCulture) ?? "",
                    row.DeliveryDays?.ToString() ?? "",
                    row.Label.ToString()
                });
        }

        private static byte[] BuildCsv<T>(
            IEnumerable<T> rows,
            string[] headers,
            Func<T, string[]> mapRow)
        {
            var sb = new StringBuilder();
            sb.AppendLine(string.Join(",", headers.Select(EscapeCsv)));

            foreach (var row in rows)
            {
                sb.AppendLine(string.Join(",", mapRow(row).Select(EscapeCsv)));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            var escaped = value.Replace("\"", "\"\"");
            return $"\"{escaped}\"";
        }
    }
}