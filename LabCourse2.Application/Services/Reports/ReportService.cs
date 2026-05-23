//per export import
using CsvHelper;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Application.DTOs.Users;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Reports;
using LabCourse2.Application.Mappings;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace LabCourse2.Application.Services.Reports
{
    public class ReportService : IReportService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly INotificationCreator _notificationCreator;

        public ReportService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            INotificationCreator notificationCreator)
        {
            _context = context;
            _currentUser = currentUser;
            _notificationCreator = notificationCreator;
        }
        //export-import
        public async Task<Result<FileExportResultDto>> ExportReportsAsync(ReportQueryParams query, string format)
        {
            format = (format ?? "csv").Trim().ToLowerInvariant();

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

            var items = await q
                .OrderByDescending(r => r.Created_at)
                .Select(r => new ReportExportDto
                {
                    ReportId = r.ReportsID,
                    Entity = r.Entity,
                    EntityId = r.EntityID,
                    Reason = r.Reason,
                    Status = r.Status,
                    UserId = r.UserID,
                    ReportedBy = r.User.Username,
                    CreatedAt = r.Created_at
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
                    FileName = $"reports_{timestamp}.csv"
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
                    FileName = $"reports_{timestamp}.json"
                });
            }

            if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Reports");

                sheet.Cells[1, 1].Value = "ReportId";
                sheet.Cells[1, 2].Value = "Entity";
                sheet.Cells[1, 3].Value = "EntityId";
                sheet.Cells[1, 4].Value = "Reason";
                sheet.Cells[1, 5].Value = "Status";
                sheet.Cells[1, 6].Value = "UserId";
                sheet.Cells[1, 7].Value = "ReportedBy";
                sheet.Cells[1, 8].Value = "CreatedAt";

                for (int i = 0; i < items.Count; i++)
                {
                    var row = i + 2;
                    var item = items[i];

                    sheet.Cells[row, 1].Value = item.ReportId.ToString();
                    sheet.Cells[row, 2].Value = item.Entity;
                    sheet.Cells[row, 3].Value = item.EntityId.ToString();
                    sheet.Cells[row, 4].Value = item.Reason;
                    sheet.Cells[row, 5].Value = item.Status;
                    sheet.Cells[row, 6].Value = item.UserId.ToString();
                    sheet.Cells[row, 7].Value = item.ReportedBy;
                    sheet.Cells[row, 8].Value = item.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                }

                sheet.Cells.AutoFitColumns();

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = package.GetAsByteArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"reports_{timestamp}.xlsx"
                });
            }

            return Result<FileExportResultDto>.Failure("Unsupported export format. Use csv, excel, or json.");
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

            var adminUserIds = await _context.Users
                .Where(u => u.Is_Active && u.UserRoles.Any(ur => ur.Role.Name == "Admin"))
                .Select(u => u.UserID)
                .Distinct()
                .ToListAsync();

            if (adminUserIds.Any())
            {
                await _notificationCreator.CreateManyAsync(
                    adminUserIds,
                    "ReportSubmitted",
                    "New report submitted",
                    $"A new report was submitted for entity \"{report.Entity}\".");
            }

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

        public async Task<Result<ImportResultDto>> ImportReportsAsync(IFormFile file, string format)
        {
            if (file == null || file.Length == 0)
                return Result<ImportResultDto>.Failure("No file was uploaded.");

            format = (format ?? "csv").Trim().ToLowerInvariant();

            List<ReportImportDto> items;

            try
            {
                if (format == "csv")
                {
                    using var stream = file.OpenReadStream();
                    using var reader = new StreamReader(stream);
                    using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

                    items = csv.GetRecords<ReportImportDto>().ToList();
                }
                else if (format == "json")
                {
                    using var stream = file.OpenReadStream();
                    items = await JsonSerializer.DeserializeAsync<List<ReportImportDto>>(stream,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }) ?? new List<ReportImportDto>();
                }
                else if (format == "excel" || format == "xlsx")
                {
                    ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                    using var stream = file.OpenReadStream();
                    using var package = new ExcelPackage(stream);
                    var sheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (sheet == null || sheet.Dimension == null)
                        return Result<ImportResultDto>.Failure("The Excel file is empty.");

                    items = new List<ReportImportDto>();

                    for (int row = 2; row <= sheet.Dimension.End.Row; row++)
                    {
                        var entityValue = sheet.Cells[row, 1].Text?.Trim();
                        var entityIdValue = sheet.Cells[row, 2].Text?.Trim();
                        var reasonValue = sheet.Cells[row, 3].Text?.Trim();
                        var statusValue = sheet.Cells[row, 4].Text?.Trim();
                        var userIdValue = sheet.Cells[row, 5].Text?.Trim();

                        items.Add(new ReportImportDto
                        {
                            Entity = entityValue ?? string.Empty,
                            EntityID = Guid.TryParse(entityIdValue, out var entityId) ? entityId : Guid.Empty,
                            Reason = reasonValue ?? string.Empty,
                            Status = string.IsNullOrWhiteSpace(statusValue) ? "Pending" : statusValue,
                            UserID = Guid.TryParse(userIdValue, out var userId) ? userId : Guid.Empty
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
                    if (string.IsNullOrWhiteSpace(item.Entity))
                    {
                        result.FailedRows++;
                        result.Errors.Add("Entity is required.");
                        continue;
                    }

                    if (item.EntityID == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"EntityID is invalid for entity '{item.Entity}'.");
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(item.Reason))
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Reason is required for entity '{item.Entity}'.");
                        continue;
                    }

                    if (item.UserID == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"UserID is invalid for entity '{item.Entity}'.");
                        continue;
                    }

                    var userExists = await _context.Users.AnyAsync(u => u.UserID == item.UserID);
                    if (!userExists)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"User with ID '{item.UserID}' was not found.");
                        continue;
                    }

                    var report = new Domain.Entities.Report
                    {
                        ReportsID = Guid.NewGuid(),
                        Entity = item.Entity,
                        EntityID = item.EntityID,
                        Reason = item.Reason,
                        Status = string.IsNullOrWhiteSpace(item.Status) ? "Pending" : item.Status,
                        UserID = item.UserID,
                        Created_at = DateTime.UtcNow,
                        Updated_at = DateTime.UtcNow,
                        Created_by = _currentUser.Username ?? "Import",
                        Updated_by = _currentUser.Username ?? "Import"
                    };

                    await _context.Reports.AddAsync(report);
                    result.ImportedRows++;
                }
                catch (Exception ex)
                {
                    result.FailedRows++;
                    result.Errors.Add(ex.Message);
                }
            }

            await _context.SaveChangesAsync();

            return Result<ImportResultDto>.Success(result);
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