using LabCourse2.Application.DTOs.Dashboard;
using LabCourse2.Application.Interfaces;
using LabCourse2.Infrastructure.Persistence; 
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LabCourse2.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            // 1. Marrim raportet (Duke përdorur Created_at dhe ReportsID)
            var recentReports = await _context.Reports
                .OrderByDescending(r => r.Created_at) 
                .Take(10)
                .Select(r => new ModerationQueueDto
                {
                    Id = r.ReportsID,          
                    Type = "Report",
                    Item = r.Reason,
                    Subject = "User: " + r.UserID.ToString(),
                    Reason = r.Status
                }).ToListAsync();

            // 2. Marrim projektet (Duke përdorur CreatedAt dhe ProjectID)
            var flaggedProjects = await _context.Projects
                .Where(p => p.Status == "Open")
                .OrderByDescending(p => p.CreatedAt) 
                .Take(5)
                .Select(p => new ModerationQueueDto
                {
                    Id = p.ProjectID, 
                    Type = "Job post",
                    Item = p.Title,
                    Subject = "Project",
                    Reason = "Policy"
                }).ToListAsync();

            // 3. Llogaritja e KPI-ve
            var totalVolume = await _context.Projects.SumAsync(p => p.Budget);
            var activeUsersCount = await _context.Users.CountAsync(u => u.Is_Active);
            var jobsPostedCount = await _context.Projects.CountAsync();

            return new DashboardStatsDto
            {
                KpiCards = new KpiCardDto
                {
                    GrossMarketplaceVolume = totalVolume,
                    ActiveUsersCount = activeUsersCount,
                    OpenDisputesCount = recentReports.Count + flaggedProjects.Count,
                    JobsPostedCount = jobsPostedCount
                },
                ModerationQueue = recentReports.Concat(flaggedProjects).ToList(),
                MarketplaceHealth = new MarketplaceHealthDto { DisputeRate = 4.2m }
            };
        }
    }
}