using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Reports;
using LabCourse2.Application.Mappings;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Reports
{
    public class ReportService : IReportService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public ReportService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Result<PagedResult<ReportResponse>>> GetAllAsync(ReportQueryParams query)
        {
            var q = _context.Reports
                .Include(r => r.User)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(r => r.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.Entity))
                q = q.Where(r => r.Entity == query.Entity);

            if (query.UserID.HasValue)
                q = q.Where(r => r.UserID == query.UserID.Value);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(r => r.Created_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return Result<PagedResult<ReportResponse>>.Success(
                new PagedResult<ReportResponse>
                {
                    Items = items.Select(r => r.ToResponse()),
                    TotalCount = totalCount,
                    Page = query.Page,
                    PageSize = query.PageSize
                });
        }

        public async Task<Result<ReportResponse>> GetByIdAsync(Guid reportId)
        {
            var report = await _context.Reports
                .Include(r => r.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReportsID == reportId);

            if (report is null)
                return Result<ReportResponse>
                    .NotFound($"Report with ID {reportId} was not found.");

            return Result<ReportResponse>.Success(report.ToResponse());
        }

        public async Task<Result<ReportResponse>> CreateAsync(CreateReportRequest request)
        {
            if (_currentUser.UserId == Guid.Empty)
                return Result<ReportResponse>.Unauthorized("User is not authenticated.");

            var userExists = await _context.Users
                .AnyAsync(u => u.UserID == _currentUser.UserId);

            if (!userExists)
                return Result<ReportResponse>.NotFound("Current user was not found.");

            var username = _currentUser.Username ?? "Unknown";

            var report = request.ToEntity();
            report.UserID = _currentUser.UserId;
            report.Created_by = username;
            report.Updated_by = username;

            await _context.Reports.AddAsync(report);
            await _context.SaveChangesAsync();

            var created = await _context.Reports
                .Include(r => r.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReportsID == report.ReportsID);

            return Result<ReportResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ReportResponse>> UpdateStatusAsync(Guid reportId, UpdateReportStatusRequest request)
        {
            var report = await _context.Reports
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.ReportsID == reportId);

            if (report is null)
                return Result<ReportResponse>
                    .NotFound($"Report with ID {reportId} was not found.");

            report.Status = request.Status;
            report.Updated_at = DateTime.UtcNow;
            report.Updated_by = _currentUser.Username ?? "Unknown";

            await _context.SaveChangesAsync();

            return Result<ReportResponse>.Success(report.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid reportId)
        {
            var report = await _context.Reports
                .FirstOrDefaultAsync(r => r.ReportsID == reportId);

            if (report is null)
                return Result<bool>
                    .NotFound($"Report with ID {reportId} was not found.");

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}