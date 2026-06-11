using CsvHelper;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Users;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Contracts;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using System.Text;
using System.Text.Json;
using LabCourse2.Application.Utilities;

namespace LabCourse2.Application.Services.Contracts
{
    public class ContractService : IContractService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly INotificationCreator _notificationCreator;
        private readonly ICacheService _cacheService;
        private readonly IAuditLogService _auditLog;

        public ContractService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            INotificationCreator notificationCreator,
            ICacheService cacheService,
            IAuditLogService auditLog)
        {
            _context = context;
            _currentUser = currentUser;
            _notificationCreator = notificationCreator;
            _cacheService = cacheService;
            _auditLog = auditLog;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ContractResponse>>> GetAllAsync(ContractQueryParams query)
        {
            var q = _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ClientID.HasValue)
                q = q.Where(c => c.ClientID == query.ClientID);

            if (query.FreelancerID.HasValue)
                q = q.Where(c => c.FreelancerID == query.FreelancerID);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            q = q.FilterByDateRange(query.StartDateFrom, query.StartDateTo,
                                         query.EndDateFrom, query.EndDateTo);

            q = q.FilterByPriceRange(query.MinPrice, query.MaxPrice);

            q = q.SearchContracts(query.Description);

            var totalCount = await q.CountAsync();

            q = q.SortContracts(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ContractResponse>>.Success(new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<PagedResult<ContractResponse>>> GetContractsByClientIDAsync(ContractQueryParams query)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<PagedResult<ContractResponse>>.Forbidden("Only clients can view their contracts.");

            var status = query.Status ?? "null";
            var projectId = query.ProjectID?.ToString() ?? "null";
            var minPrice = query.MinPrice?.ToString() ?? "null";
            var maxPrice = query.MaxPrice?.ToString() ?? "null";
            var sortBy = query.SortBy ?? "startDate";
            var cacheKey = $"contracts_client_{client.ClientID}_{query.Page}_{query.PageSize}_{status}_{projectId}_{minPrice}_{maxPrice}_{sortBy}";

            var cached = await _cacheService.GetAsync<PagedResult<ContractResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<ContractResponse>>.Success(cached);

            var q = _context.Contracts
                .Where(c => c.ClientID == client.ClientID)
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            q = q.FilterByDateRange(query.StartDateFrom, query.StartDateTo,
                                         query.EndDateFrom, query.EndDateTo);

            q = q.FilterByPriceRange(query.MinPrice, query.MaxPrice);

            q = q.SearchContracts(query.Description);

            var totalCount = await q.CountAsync();

            q = q.SortContracts(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            var result = new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
            return Result<PagedResult<ContractResponse>>.Success(result);
        }

        public async Task<Result<PagedResult<ContractResponse>>> GetContractsByFreelancerIDAsync(ContractQueryParams query)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<PagedResult<ContractResponse>>.Forbidden("Only freelancers can view their contracts.");

            var status = query.Status ?? "null";
            var projectId = query.ProjectID?.ToString() ?? "null";
            var sortBy = query.SortBy ?? "startDate";
            var cacheKey = $"contracts_freelancer_{freelancer.FreelancerID}_{query.Page}_{query.PageSize}_{status}_{projectId}_{sortBy}";

            var cached = await _cacheService.GetAsync<PagedResult<ContractResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<ContractResponse>>.Success(cached);

            var q = _context.Contracts
                .Where(c => c.FreelancerID == freelancer.FreelancerID)
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID);

            q = q.FilterByDateRange(query.StartDateFrom, query.StartDateTo,
                                         query.EndDateFrom, query.EndDateTo);

            q = q.FilterByPriceRange(query.MinPrice, query.MaxPrice);

            q = q.SearchContracts(query.Description);

            var totalCount = await q.CountAsync();

            q = q.SortContracts(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => c.ToResponse())
                .ToListAsync();

            var result = new PagedResult<ContractResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
            return Result<PagedResult<ContractResponse>>.Success(result);
        }

        public async Task<Result<ContractResponse>> GetByIdAsync(Guid id)
        {
            var contract = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<ContractResponse>.NotFound($"Contract with ID {id} was not found.");

            return Result<ContractResponse>.Success(contract.ToResponse());
        }

        public async Task<Result<ContractResponse>> CreateAsync(CreateContractRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can create contracts.");

            var projectExists = await _context.Projects
                .AnyAsync(p => p.ProjectID == request.ProjectID);

            if (!projectExists)
                return Result<ContractResponse>.NotFound("Project not found.");

            var freelancerExists = await _context.FreelancerProfiles
                .AnyAsync(f => f.FreelancerID == request.FreelancerID);

            if (!freelancerExists)
                return Result<ContractResponse>.NotFound("Freelancer not found.");

            var contract = request.ToEntity(client.ClientID);

            await _context.Contracts.AddAsync(contract);
            await _context.SaveChangesAsync();

            var created = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            if (created?.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    created.Freelancer.User.UserID,
                    "ContractCreated",
                    "New contract created",
                    $"You have been assigned a new contract for project \"{created.Project?.Title}\".");
            }

            await _cacheService.RemoveByPatternAsync("contracts_*");

            return Result<ContractResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ContractResponse>> UpdateAsync(Guid id, UpdateContractRequest request)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can update contracts.");

            var contract = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<ContractResponse>.NotFound($"Contract with ID {id} was not found.");

            if (contract.ClientID != client.ClientID)
                return Result<ContractResponse>.Forbidden("You do not own this contract.");

            var oldStatus = contract.Status;

            contract.ApplyUpdate(request);
            await _context.SaveChangesAsync();

            if (contract.Status == ContractStatus.Cancelled && oldStatus != ContractStatus.Cancelled)
                await _auditLog.LogAsync(
                    action: AuditAction.ContractCancelled,
                    entity: "Contract",
                    oldValue: oldStatus,
                    newValue: ContractStatus.Cancelled,
                    entityId: contract.ContractID,
                    userId: _currentUser.UserId);

            var updated = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            await _cacheService.RemoveByPatternAsync("contracts_*");

            return Result<ContractResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var client = await GetClientProfileAsync();

            if (client is null)
                return Result<bool>.Forbidden("Only clients can delete contracts.");

            var contract = await _context.Contracts
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (contract is null)
                return Result<bool>.NotFound($"Contract with ID {id} was not found.");

            if (contract.ClientID != client.ClientID)
                return Result<bool>.Forbidden("You do not own this contract.");
await _cacheService.RemoveByPatternAsync("contracts_*");

            
            _context.Contracts.Remove(contract);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<FileExportResultDto>> ExportContractsAsync(ContractQueryParams query, string format)
        {
            format = (format ?? "csv").Trim().ToLowerInvariant();

            var q = _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(c => c.Status == query.Status);

            if (query.ClientID.HasValue)
                q = q.Where(c => c.ClientID == query.ClientID.Value);

            if (query.FreelancerID.HasValue)
                q = q.Where(c => c.FreelancerID == query.FreelancerID.Value);

            if (query.ProjectID.HasValue)
                q = q.Where(c => c.ProjectID == query.ProjectID.Value);

            var items = await q
                .OrderByDescending(c => c.Start_Date)
                .Select(c => new ContractExportDto
                {
                    ContractID = c.ContractID,
                    Description = c.Description,
                    ClientID = c.ClientID,
                    ClientName = c.Client.User.Username,
                    FreelancerID = c.FreelancerID,
                    FreelancerName = c.Freelancer.User.Username,
                    ProjectID = c.ProjectID,
                    ProjectTitle = c.Project.Title,
                    ProposalID = c.ProposalID,
                    AgreedPrice = c.Agreed_Price,
                    StartDate = c.Start_Date,
                    EndDate = c.End_Date,
                    Status = c.Status
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
                    FileName = $"contracts_{timestamp}.csv"
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
                    FileName = $"contracts_{timestamp}.json"
                });
            }

            if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Contracts");

                sheet.Cells[1, 1].Value = "Description";
                sheet.Cells[1, 2].Value = "ClientID";
                sheet.Cells[1, 3].Value = "FreelancerID";
                sheet.Cells[1, 4].Value = "ProjectID";
                sheet.Cells[1, 5].Value = "ProposalID";
                sheet.Cells[1, 6].Value = "AgreedPrice";
                sheet.Cells[1, 7].Value = "StartDate";
                sheet.Cells[1, 8].Value = "EndDate";
                sheet.Cells[1, 9].Value = "Status";
                sheet.Cells[1, 10].Value = "ContractID";
                sheet.Cells[1, 11].Value = "ClientName";
                sheet.Cells[1, 12].Value = "FreelancerName";
                sheet.Cells[1, 13].Value = "ProjectTitle";

                for (int i = 0; i < items.Count; i++)
                {
                    var row = i + 2;
                    var item = items[i];

                    sheet.Cells[row, 1].Value = item.Description;
                    sheet.Cells[row, 2].Value = item.ClientID.ToString();
                    sheet.Cells[row, 3].Value = item.FreelancerID.ToString();
                    sheet.Cells[row, 4].Value = item.ProjectID.ToString();
                    sheet.Cells[row, 5].Value = item.ProposalID?.ToString();
                    sheet.Cells[row, 6].Value = item.AgreedPrice;
                    sheet.Cells[row, 7].Value = item.StartDate.ToString("yyyy-MM-dd");
                    sheet.Cells[row, 8].Value = item.EndDate.ToString("yyyy-MM-dd");
                    sheet.Cells[row, 9].Value = item.Status;
                    sheet.Cells[row, 10].Value = item.ContractID.ToString();
                    sheet.Cells[row, 11].Value = item.ClientName;
                    sheet.Cells[row, 12].Value = item.FreelancerName;
                    sheet.Cells[row, 13].Value = item.ProjectTitle;
                }

                sheet.Cells.AutoFitColumns();

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = package.GetAsByteArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"contracts_{timestamp}.xlsx"
                });
            }

            return Result<FileExportResultDto>.Failure("Unsupported export format. Use csv, excel, or json.");
        }

        public async Task<Result<ImportResultDto>> ImportContractsAsync(IFormFile file, string format)
        {
            if (file == null || file.Length == 0)
                return Result<ImportResultDto>.Failure("No file was uploaded.");

            format = (format ?? "csv").Trim().ToLowerInvariant();

            List<ContractImportDto> items;

            try
            {
                if (format == "csv")
                {
                    using var stream = file.OpenReadStream();
                    using var reader = new StreamReader(stream);
                    using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

                    items = csv.GetRecords<ContractImportDto>().ToList();
                }
                else if (format == "json")
                {
                    using var stream = file.OpenReadStream();
                    items = await JsonSerializer.DeserializeAsync<List<ContractImportDto>>(stream,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }) ?? new List<ContractImportDto>();
                }
                else if (format == "excel" || format == "xlsx")
                {
                    ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                    using var stream = file.OpenReadStream();
                    using var package = new ExcelPackage(stream);
                    var sheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (sheet == null || sheet.Dimension == null)
                        return Result<ImportResultDto>.Failure("The Excel file is empty.");

                    items = new List<ContractImportDto>();

                    for (int row = 2; row <= sheet.Dimension.End.Row; row++)
                    {
                        var descriptionValue = sheet.Cells[row, 1].Text?.Trim();
                        var clientIdValue = sheet.Cells[row, 2].Text?.Trim();
                        var freelancerIdValue = sheet.Cells[row, 3].Text?.Trim();
                        var projectIdValue = sheet.Cells[row, 4].Text?.Trim();
                        var proposalIdValue = sheet.Cells[row, 5].Text?.Trim();
                        var agreedPriceValue = sheet.Cells[row, 6].Text?.Trim();
                        var startDateValue = sheet.Cells[row, 7].Text?.Trim();
                        var endDateValue = sheet.Cells[row, 8].Text?.Trim();
                        var statusValue = sheet.Cells[row, 9].Text?.Trim();

                        items.Add(new ContractImportDto
                        {
                            Description = descriptionValue ?? string.Empty,
                            ClientID = Guid.TryParse(clientIdValue, out var clientId) ? clientId : Guid.Empty,
                            FreelancerID = Guid.TryParse(freelancerIdValue, out var freelancerId) ? freelancerId : Guid.Empty,
                            ProjectID = Guid.TryParse(projectIdValue, out var projectId) ? projectId : Guid.Empty,
                            ProposalID = Guid.TryParse(proposalIdValue, out var proposalId) ? proposalId : null,
                            AgreedPrice = decimal.TryParse(agreedPriceValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var agreedPrice) ? agreedPrice : 0,
                            StartDate = DateTime.TryParse(startDateValue, CultureInfo.InvariantCulture, DateTimeStyles.None, out var startDate) ? startDate : DateTime.MinValue,
                            EndDate = DateTime.TryParse(endDateValue, CultureInfo.InvariantCulture, DateTimeStyles.None, out var endDate) ? endDate : DateTime.MinValue,
                            Status = string.IsNullOrWhiteSpace(statusValue) ? "Pending" : statusValue
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
                    if (string.IsNullOrWhiteSpace(item.Description))
                    {
                        result.FailedRows++;
                        result.Errors.Add("Description is required.");
                        continue;
                    }

                    if (item.ClientID == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add("ClientID is invalid.");
                        continue;
                    }

                    if (item.FreelancerID == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add("FreelancerID is invalid.");
                        continue;
                    }

                    if (item.ProjectID == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add("ProjectID is invalid.");
                        continue;
                    }

                    if (item.AgreedPrice <= 0)
                    {
                        result.FailedRows++;
                        result.Errors.Add("AgreedPrice must be greater than 0.");
                        continue;
                    }

                    if (item.StartDate == DateTime.MinValue)
                    {
                        result.FailedRows++;
                        result.Errors.Add("StartDate is invalid.");
                        continue;
                    }

                    if (item.EndDate == DateTime.MinValue)
                    {
                        result.FailedRows++;
                        result.Errors.Add("EndDate is invalid.");
                        continue;
                    }

                    if (item.EndDate < item.StartDate)
                    {
                        result.FailedRows++;
                        result.Errors.Add("EndDate cannot be earlier than StartDate.");
                        continue;
                    }

                    var clientExists = await _context.ClientProfiles.AnyAsync(c => c.ClientID == item.ClientID);
                    if (!clientExists)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Client with ID '{item.ClientID}' was not found.");
                        continue;
                    }

                    var freelancerExists = await _context.FreelancerProfiles.AnyAsync(f => f.FreelancerID == item.FreelancerID);
                    if (!freelancerExists)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Freelancer with ID '{item.FreelancerID}' was not found.");
                        continue;
                    }

                    var projectExists = await _context.Projects.AnyAsync(p => p.ProjectID == item.ProjectID);
                    if (!projectExists)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Project with ID '{item.ProjectID}' was not found.");
                        continue;
                    }

                    if (item.ProposalID.HasValue)
                    {
                        var proposalExists = await _context.Proposals
                            .AnyAsync(p => p.ProposalId == item.ProposalID.Value);

                        if (!proposalExists)
                        {
                            result.FailedRows++;
                            result.Errors.Add($"Proposal with ID '{item.ProposalID}' was not found.");
                            continue;
                        }
                    }

                    var contract = new Contract
                    {
                        ContractID = Guid.NewGuid(),
                        Description = item.Description,
                        ClientID = item.ClientID,
                        FreelancerID = item.FreelancerID,
                        ProjectID = item.ProjectID,
                        ProposalID = item.ProposalID,
                        Agreed_Price = item.AgreedPrice,
                        Start_Date = item.StartDate,
                        End_Date = item.EndDate,
                        Status = string.IsNullOrWhiteSpace(item.Status) ? "Pending" : item.Status
                    };

                    await _context.Contracts.AddAsync(contract);
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
    }
}