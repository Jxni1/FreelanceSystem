using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Proposals;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using CsvHelper;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Users;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System.Globalization;
using System.Text;
using System.Text.Json;
using LabCourse2.Application.Utilities;

namespace LabCourse2.Application.Services.Proposals
{
    public class ProposalService : IProposalService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly INotificationCreator _notificationCreator;
        private readonly ICacheService _cacheService;

        public ProposalService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            INotificationCreator notificationCreator,
            ICacheService cacheService)
        {
            _context = context;
            _currentUser = currentUser;
            _notificationCreator = notificationCreator;
            _cacheService = cacheService;
        }

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ProposalResponse>>> GetAllAsync(ProposalQueryParams query)
        {
            var freelancer = await GetFreelancerProfileAsync();
            var client = await GetClientProfileAsync();

            if (freelancer is null && client is null)
                return Result<PagedResult<ProposalResponse>>
                    .Forbidden("You must have a freelancer or client profile.");

            var userContext = freelancer?.FreelancerID.ToString() ?? client!.ClientID.ToString();
            var status = query.Status ?? "null";
            var projectId = query.ProjectId?.ToString() ?? "null";
            var cacheKey = $"proposals_{userContext}_{query.Page}_{query.PageSize}_{status}_{projectId}";

            var cached = await _cacheService.GetAsync<PagedResult<ProposalResponse>>(cacheKey);
            if (cached != null)
                return Result<PagedResult<ProposalResponse>>.Success(cached);

            var q = _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .AsQueryable();
 
            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(p => p.Status == query.Status);

            if (query.ProjectId.HasValue)
                q = q.Where(p => p.ProjectId == query.ProjectId);

            if (query.FreelancerId.HasValue)
                q = q.Where(p => p.FreelancerId == query.FreelancerId);
 
            q = q.FilterByBidRange(query.MinBidAmount, query.MaxBidAmount);
 
            q = q.FilterByDeliveryDays(query.MinDeliveryDays, query.MaxDeliveryDays);
 
            q = q.SearchProposals(query.SearchMessage);

            var totalCount = await q.CountAsync();
 
            q = q.SortProposals(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => p.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ProposalResponse>>.Success(new PagedResult<ProposalResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ProposalResponse>> GetByIdAsync(Guid id)
        {
            var proposal = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProposalId == id);

            if (proposal is null)
                return Result<ProposalResponse>.NotFound($"Proposal with ID {id} was not found.");

            return Result<ProposalResponse>.Success(proposal.ToResponse());
        }
        public async Task<Result<FileExportResultDto>> ExportProposalsAsync(ProposalQueryParams query, string format)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<FileExportResultDto>.Forbidden("Only freelancers can export proposals.");

            format = (format ?? "csv").Trim().ToLowerInvariant();

            var q = _context.Proposals
                .Include(p => p.Project)
                .AsNoTracking()
                .Where(p => p.FreelancerId == freelancer.FreelancerID)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(p => p.Status == query.Status);

            if (query.ProjectId.HasValue)
                q = q.Where(p => p.ProjectId == query.ProjectId.Value);

            q = q.FilterByBidRange(query.MinBidAmount, query.MaxBidAmount);
            q = q.FilterByDeliveryDays(query.MinDeliveryDays, query.MaxDeliveryDays);
            q = q.SearchProposals(query.SearchMessage);
            q = q.SortProposals(query.SortBy, query.SortOrder);

            var items = await q
                .Select(p => new ProposalExportDto
                {
                    ProposalId = p.ProposalId,
                    ProjectId = p.ProjectId,
                    ProjectTitle = p.Project.Title,
                    Message = p.Message,
                    BidAmount = p.BidAmount,
                    DeliveryDays = p.DeliveryDays,
                    Status = p.Status,
                    CreatedAt = p.Created_at
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
                    FileName = $"proposals_{timestamp}.csv"
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
                    FileName = $"proposals_{timestamp}.json"
                });
            }

            if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Proposals");

                sheet.Cells[1, 1].Value = "ProposalId";
                sheet.Cells[1, 2].Value = "ProjectId";
                sheet.Cells[1, 3].Value = "ProjectTitle";
                sheet.Cells[1, 4].Value = "Message";
                sheet.Cells[1, 5].Value = "BidAmount";
                sheet.Cells[1, 6].Value = "DeliveryDays";
                sheet.Cells[1, 7].Value = "Status";
                sheet.Cells[1, 8].Value = "CreatedAt";

                for (int i = 0; i < items.Count; i++)
                {
                    var row = i + 2;
                    var item = items[i];

                    sheet.Cells[row, 1].Value = item.ProposalId.ToString();
                    sheet.Cells[row, 2].Value = item.ProjectId.ToString();
                    sheet.Cells[row, 3].Value = item.ProjectTitle;
                    sheet.Cells[row, 4].Value = item.Message;
                    sheet.Cells[row, 5].Value = item.BidAmount;
                    sheet.Cells[row, 6].Value = item.DeliveryDays;
                    sheet.Cells[row, 7].Value = item.Status;
                    sheet.Cells[row, 8].Value = item.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                }

                sheet.Cells.AutoFitColumns();

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = package.GetAsByteArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"proposals_{timestamp}.xlsx"
                });
            }

            return Result<FileExportResultDto>.Failure("Unsupported export format. Use csv, excel, or json.");
        }
        public async Task<Result<ProposalResponse>> CreateAsync(CreateProposalRequest request)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<ProposalResponse>.Forbidden("Only freelancers can submit proposals.");

            var project = await _context.Projects
                .Include(p => p.Client)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(p => p.ProjectID == request.ProjectId);

            if (project is null)
                return Result<ProposalResponse>.NotFound($"Project with ID {request.ProjectId} was not found.");

            if (project.Status != ProjectStatus.Open)
                return Result<ProposalResponse>.Failure("Can only submit proposals to open projects.");

            var alreadyProposed = await _context.Proposals.AnyAsync(p =>
                p.ProjectId == request.ProjectId &&
                p.FreelancerId == freelancer.FreelancerID &&
                p.Status == ProposalStatus.Pending);

            if (alreadyProposed)
                return Result<ProposalResponse>.Conflict("You already have a pending proposal for this project.");

            var proposal = request.ToEntity(freelancer.FreelancerID);
            await _context.Proposals.AddAsync(proposal);
            await _context.SaveChangesAsync();

            var created = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProposalId == proposal.ProposalId);

            if (project.Client?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    project.Client.User.UserID,
                    "ProposalSubmitted",
                    "New proposal received",
                    $"A new proposal was submitted for your project \"{project.Title}\".");
            }

            await _cacheService.RemoveByPatternAsync("proposals_*");

            return Result<ProposalResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ContractResponse>> AcceptAsync(Guid proposalId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ContractResponse>.Forbidden("Only clients can accept proposals.");

            var proposal = await _context.Proposals
                .Include(p => p.Project)
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .FirstOrDefaultAsync(p => p.ProposalId == proposalId);

            if (proposal is null)
                return Result<ContractResponse>.NotFound($"Proposal with ID {proposalId} was not found.");

            if (proposal.Project.ClientID != client.ClientID)
                return Result<ContractResponse>.Forbidden("You do not own the project this proposal belongs to.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<ContractResponse>.Conflict($"Proposal is already {proposal.Status.ToLower()}.");

            var existingContract = await _context.Contracts
                .AnyAsync(c => c.ProposalID == proposalId);

            if (existingContract)
                return Result<ContractResponse>.Conflict("A contract already exists for this proposal.");

            proposal.Status = ProposalStatus.Accepted;

            var startDate = DateTime.UtcNow;
            var contract = new Contract
            {
                ContractID = Guid.NewGuid(),
                Description = proposal.Message,
                Start_Date = startDate,
                End_Date = startDate.AddDays(proposal.DeliveryDays),
                Agreed_Price = proposal.BidAmount,
                Status = ContractStatus.Active,
                ClientID = client.ClientID,
                FreelancerID = proposal.FreelancerId,
                ProjectID = proposal.ProjectId,
                ProposalID = proposal.ProposalId
            };

            await _context.Contracts.AddAsync(contract);

            var otherProposals = await _context.Proposals
                .Include(p => p.Freelancer)
                    .ThenInclude(f => f.User)
                .Where(p => p.ProjectId == proposal.ProjectId
                         && p.ProposalId != proposalId
                         && p.Status == ProposalStatus.Pending)
                .ToListAsync();

            foreach (var other in otherProposals)
                other.Status = ProposalStatus.Rejected;

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectID == proposal.ProjectId);

            if (project is not null)
                project.Status = ProjectStatus.InProgress;

            await _context.SaveChangesAsync();

            if (proposal.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    proposal.Freelancer.User.UserID,
                    "ProposalAccepted",
                    "Proposal accepted",
                    $"Your proposal for project \"{proposal.Project.Title}\" was accepted.");
            }

            var rejectedUserIds = otherProposals
                .Where(p => p.Freelancer?.User?.UserID != null)
                .Select(p => p.Freelancer!.User!.UserID)
                .Distinct()
                .ToList();

            if (rejectedUserIds.Any())
            {
                await _notificationCreator.CreateManyAsync(
                    rejectedUserIds,
                    "ProposalRejected",
                    "Proposal not selected",
                    $"Your proposal for project \"{proposal.Project.Title}\" was not selected.");
            }

            var created = await _context.Contracts
                .Include(c => c.Client).ThenInclude(cl => cl.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .Include(c => c.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

            await _cacheService.RemoveByPatternAsync("proposals_*");
            await _cacheService.RemoveByPatternAsync("contracts_*");

            return Result<ContractResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ProposalResponse>> RejectAsync(Guid proposalId)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ProposalResponse>.Forbidden("Only clients can reject proposals.");

            var proposal = await _context.Proposals
                .Include(p => p.Freelancer).ThenInclude(f => f.User)
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.ProposalId == proposalId);

            if (proposal is null)
                return Result<ProposalResponse>.NotFound($"Proposal with ID {proposalId} was not found.");

            if (proposal.Project.ClientID != client.ClientID)
                return Result<ProposalResponse>.Forbidden("You do not own the project this proposal belongs to.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<ProposalResponse>.Conflict($"Proposal is already {proposal.Status.ToLower()}.");

            proposal.Status = ProposalStatus.Rejected;
            await _context.SaveChangesAsync();

            if (proposal.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    proposal.Freelancer.User.UserID,
                    "ProposalRejected",
                    "Proposal rejected",
                    $"Your proposal for project \"{proposal.Project.Title}\" was rejected.");
            }

            return Result<ProposalResponse>.Success(proposal.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<bool>.Forbidden("Only freelancers can delete their proposals.");

            var proposal = await _context.Proposals
                .FirstOrDefaultAsync(p => p.ProposalId == id);

            if (proposal is null)
                return Result<bool>.NotFound($"Proposal with ID {id} was not found.");

            if (proposal.FreelancerId != freelancer.FreelancerID)
                return Result<bool>.Forbidden("You do not own this proposal.");

            if (proposal.Status != ProposalStatus.Pending)
                return Result<bool>.Failure("Only pending proposals can be deleted.");

            _context.Proposals.Remove(proposal);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
        public async Task<Result<ImportResultDto>> ImportProposalsAsync(IFormFile file, string format)
        {
            var freelancer = await GetFreelancerProfileAsync();
            if (freelancer is null)
                return Result<ImportResultDto>.Forbidden("Only freelancers can import proposals.");

            if (file == null || file.Length == 0)
                return Result<ImportResultDto>.Failure("No file was uploaded.");

            format = (format ?? "csv").Trim().ToLowerInvariant();

            List<ProposalImportDto> items;

            try
            {
                if (format == "csv")
                {
                    using var stream = file.OpenReadStream();
                    using var reader = new StreamReader(stream);
                    using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

                    items = csv.GetRecords<ProposalImportDto>().ToList();
                }
                else if (format == "json")
                {
                    using var stream = file.OpenReadStream();
                    items = await JsonSerializer.DeserializeAsync<List<ProposalImportDto>>(stream,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }) ?? new List<ProposalImportDto>();
                }
                else if (format == "excel" || format == "xlsx")
                {
                    ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                    using var stream = file.OpenReadStream();
                    using var package = new ExcelPackage(stream);
                    var sheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (sheet == null || sheet.Dimension == null)
                        return Result<ImportResultDto>.Failure("The Excel file is empty.");

                    items = new List<ProposalImportDto>();

                    for (int row = 2; row <= sheet.Dimension.End.Row; row++)
                    {
                        var projectIdValue = sheet.Cells[row, 2].Text?.Trim();
                        var messageValue = sheet.Cells[row, 4].Text?.Trim();
                        var bidAmountValue = sheet.Cells[row, 5].Text?.Trim();
                        var deliveryDaysValue = sheet.Cells[row, 6].Text?.Trim();

                        items.Add(new ProposalImportDto
                        {
                            ProjectId = Guid.TryParse(projectIdValue, out var projectId) ? projectId : Guid.Empty,
                            Message = messageValue ?? string.Empty,
                            BidAmount = decimal.TryParse(bidAmountValue, out var bidAmount) ? bidAmount : 0,
                            DeliveryDays = int.TryParse(deliveryDaysValue, out var deliveryDays) ? deliveryDays : 0
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
                    if (item.ProjectId == Guid.Empty)
                    {
                        result.FailedRows++;
                        result.Errors.Add("ProjectId is required.");
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(item.Message))
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Message is required for project '{item.ProjectId}'.");
                        continue;
                    }

                    if (item.BidAmount <= 0)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"BidAmount must be greater than 0 for project '{item.ProjectId}'.");
                        continue;
                    }

                    if (item.DeliveryDays <= 0)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"DeliveryDays must be greater than 0 for project '{item.ProjectId}'.");
                        continue;
                    }

                    var project = await _context.Projects
                        .Include(p => p.Client)
                            .ThenInclude(c => c.User)
                        .FirstOrDefaultAsync(p => p.ProjectID == item.ProjectId);

                    if (project is null)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Project with ID '{item.ProjectId}' was not found.");
                        continue;
                    }

                    if (project.Status != ProjectStatus.Open)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"Project '{project.Title}' is not open.");
                        continue;
                    }

                    var alreadyProposed = await _context.Proposals.AnyAsync(p =>
                        p.ProjectId == item.ProjectId &&
                        p.FreelancerId == freelancer.FreelancerID &&
                        p.Status == ProposalStatus.Pending);

                    if (alreadyProposed)
                    {
                        result.FailedRows++;
                        result.Errors.Add($"You already have a pending proposal for project '{project.Title}'.");
                        continue;
                    }

                    var proposal = new Proposal
                    {
                        ProposalId = Guid.NewGuid(),
                        ProjectId = item.ProjectId,
                        FreelancerId = freelancer.FreelancerID,
                        Message = item.Message.Trim(),
                        BidAmount = item.BidAmount,
                        DeliveryDays = item.DeliveryDays,
                        Status = ProposalStatus.Pending,
                        Created_at = DateTime.UtcNow
                    };

                    await _context.Proposals.AddAsync(proposal);
                    result.ImportedRows++;

                    if (project.Client?.User?.UserID != null)
                    {
                        await _notificationCreator.CreateAsync(
                            project.Client.User.UserID,
                            "ProposalSubmitted",
                            "New proposal received",
                            $"A new proposal was submitted for your project \"{project.Title}\".");
                    }
                }
                catch (Exception ex)
                {
                    result.FailedRows++;
                    result.Errors.Add(ex.Message);
                }
            }

            await _context.SaveChangesAsync();
            await _cacheService.RemoveByPatternAsync("proposals_*");

            return Result<ImportResultDto>.Success(result);
        }
    }
}