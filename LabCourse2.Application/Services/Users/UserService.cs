using CsvHelper;
using CsvHelper.Configuration;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Users;
using LabCourse2.Application.Interfaces.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace LabCourse2.Application.Services.User
{
    public class UserService : IUserService
    {
        private readonly IAppDbContext _db;
        private readonly ClaimsPrincipal? _user;

        public UserService(IAppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _user = httpContextAccessor.HttpContext?.User;
        }
        public async Task<Result<bool>> DeleteCurrentUserAsync(DeleteUserRequest request)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == UserId);

            if (user is null)
                return Result<bool>.Failure("User not found.");

            if (user.Is_Deleted)
                return Result<bool>.Failure("User is already deleted.");

            user.Is_Deleted = true;
            user.Is_Active = false;
            user.Deleted_At = DateTime.UtcNow;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<FileExportResultDto>> ExportUsersAsync(UserQueryParams query, string format)
        {
            format = (format ?? "csv").Trim().ToLowerInvariant();

            var q = _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                q = q.Where(u =>
                    u.Name.Contains(search) ||
                    u.Surname.Contains(search) ||
                    u.Username.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (query.IsActive.HasValue)
                q = q.Where(u => u.Is_Active == query.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(query.Role))
                q = q.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            var items = await q
                .OrderByDescending(u => u.Created_At)
                .Select(u => new UserExportDto
                {
                    UserId = u.UserID,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    Email = u.Email,
                    IsActive = u.Is_Active,
                    Roles = string.Join(", ", u.UserRoles.Select(ur => ur.Role.Name)),
                    CreatedAt = u.Created_At
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
                    FileName = $"users_{timestamp}.csv"
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
                    FileName = $"users_{timestamp}.json"
                });
            }

            if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Users");

                sheet.Cells[1, 1].Value = "UserId";
                sheet.Cells[1, 2].Value = "Name";
                sheet.Cells[1, 3].Value = "Surname";
                sheet.Cells[1, 4].Value = "Username";
                sheet.Cells[1, 5].Value = "Email";
                sheet.Cells[1, 6].Value = "IsActive";
                sheet.Cells[1, 7].Value = "Roles";
                sheet.Cells[1, 8].Value = "CreatedAt";

                for (int i = 0; i < items.Count; i++)
                {
                    var row = i + 2;
                    var item = items[i];

                    sheet.Cells[row, 1].Value = item.UserId.ToString();
                    sheet.Cells[row, 2].Value = item.Name;
                    sheet.Cells[row, 3].Value = item.Surname;
                    sheet.Cells[row, 4].Value = item.Username;
                    sheet.Cells[row, 5].Value = item.Email;
                    sheet.Cells[row, 6].Value = item.IsActive;
                    sheet.Cells[row, 7].Value = item.Roles;
                    sheet.Cells[row, 8].Value = item.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                }

                sheet.Cells.AutoFitColumns();

                return Result<FileExportResultDto>.Success(new FileExportResultDto
                {
                    Content = package.GetAsByteArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"users_{timestamp}.xlsx"
                });
            }

            return Result<FileExportResultDto>.Failure("Unsupported export format. Use csv, excel, or json.");
        }

        public async Task<Result<ImportResultDto>> ImportUsersAsync(IFormFile file, string format)
        {
            format = (format ?? "csv").Trim().ToLowerInvariant();

            var rows = new List<UserImportDto>();

            if (format == "json")
            {
                using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();

                if (string.IsNullOrWhiteSpace(json))
                    return Result<ImportResultDto>.Failure("JSON file is empty.");

                using var document = JsonDocument.Parse(json);

                if (document.RootElement.ValueKind != JsonValueKind.Array)
                    return Result<ImportResultDto>.Failure("JSON import expects an array of users.");

                foreach (var item in document.RootElement.EnumerateArray())
                {
                    string GetString(params string[] keys)
                    {
                        foreach (var key in keys)
                        {
                            foreach (var property in item.EnumerateObject())
                            {
                                if (string.Equals(property.Name, key, StringComparison.OrdinalIgnoreCase))
                                    return property.Value.ValueKind == JsonValueKind.Null
                                        ? string.Empty
                                        : property.Value.ToString().Trim();
                            }
                        }

                        return string.Empty;
                    }

                    decimal? GetDecimal(params string[] keys)
                    {
                        var value = GetString(keys);
                        return decimal.TryParse(value, out var number) ? number : null;
                    }

                    var name = GetString("Name");
                    var surname = GetString("Surname");
                    var username = GetString("Username");
                    var email = GetString("Email");

                    if (string.IsNullOrWhiteSpace(name) &&
                        string.IsNullOrWhiteSpace(surname) &&
                        string.IsNullOrWhiteSpace(username) &&
                        string.IsNullOrWhiteSpace(email))
                    {
                        continue;
                    }

                    var password = GetString("Password");
                    if (string.IsNullOrWhiteSpace(password))
                        password = "Admin123!";

                    var confirmPassword = GetString("ConfirmPassword");
                    if (string.IsNullOrWhiteSpace(confirmPassword))
                        confirmPassword = password;

                    var role = GetString("Role", "Roles");
                    if (string.IsNullOrWhiteSpace(role))
                        role = "Client";

                    rows.Add(new UserImportDto
                    {
                        Name = name,
                        Surname = surname,
                        Username = username,
                        Email = email,
                        Password = password,
                        ConfirmPassword = confirmPassword,
                        Role = role,
                        ExperienceLevel = GetString("ExperienceLevel"),
                        HourlyRate = GetDecimal("HourlyRate"),
                        Bio = GetString("Bio"),
                        Industry = GetString("Industry"),
                        Budget = GetDecimal("Budget")
                    });
                }
            }
            else if (format == "csv")
            {
                using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream);

                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    MissingFieldFound = null,
                    HeaderValidated = null,
                    BadDataFound = null,
                    PrepareHeaderForMatch = args => args.Header?.Trim() ?? string.Empty
                };

                using var csv = new CsvReader(reader, config);

                if (!csv.Read())
                    return Result<ImportResultDto>.Failure("CSV file is empty.");

                csv.ReadHeader();

                var headers = csv.HeaderRecord ?? Array.Empty<string>();

                string GetFieldSafe(params string[] names)
                {
                    foreach (var name in names)
                    {
                        var matchedHeader = headers.FirstOrDefault(h =>
                            string.Equals(h?.Trim(), name, StringComparison.OrdinalIgnoreCase));

                        if (!string.IsNullOrWhiteSpace(matchedHeader))
                        {
                            try
                            {
                                return csv.GetField(matchedHeader)?.Trim() ?? string.Empty;
                            }
                            catch
                            {
                                return string.Empty;
                            }
                        }
                    }

                    return string.Empty;
                }

                while (csv.Read())
                {
                    var name = GetFieldSafe("Name");
                    var surname = GetFieldSafe("Surname");
                    var username = GetFieldSafe("Username");
                    var email = GetFieldSafe("Email");

                    if (string.IsNullOrWhiteSpace(name) &&
                        string.IsNullOrWhiteSpace(surname) &&
                        string.IsNullOrWhiteSpace(username) &&
                        string.IsNullOrWhiteSpace(email))
                    {
                        continue;
                    }

                    var password = GetFieldSafe("Password");
                    if (string.IsNullOrWhiteSpace(password))
                        password = "Admin123!";

                    var confirmPassword = GetFieldSafe("ConfirmPassword");
                    if (string.IsNullOrWhiteSpace(confirmPassword))
                        confirmPassword = password;

                    var role = GetFieldSafe("Role", "Roles");
                    if (string.IsNullOrWhiteSpace(role))
                        role = "Client";

                    rows.Add(new UserImportDto
                    {
                        Name = name,
                        Surname = surname,
                        Username = username,
                        Email = email,
                        Password = password,
                        ConfirmPassword = confirmPassword,
                        Role = role,
                        ExperienceLevel = GetFieldSafe("ExperienceLevel"),
                        HourlyRate = decimal.TryParse(GetFieldSafe("HourlyRate"), out var hr) ? hr : null,
                        Bio = GetFieldSafe("Bio"),
                        Industry = GetFieldSafe("Industry"),
                        Budget = decimal.TryParse(GetFieldSafe("Budget"), out var budget) ? budget : null
                    });
                }
            }
            else if (format == "excel" || format == "xlsx")
            {
                ExcelPackage.License.SetNonCommercialOrganization("LabCourse2");

                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                var sheet = package.Workbook.Worksheets.FirstOrDefault();

                if (sheet == null)
                    return Result<ImportResultDto>.Failure("Excel file is empty.");

                var rowCount = sheet.Dimension?.Rows ?? 0;

                for (int row = 2; row <= rowCount; row++)
                {
                    var name = sheet.Cells[row, 1].Text?.Trim() ?? string.Empty;
                    var surname = sheet.Cells[row, 2].Text?.Trim() ?? string.Empty;
                    var username = sheet.Cells[row, 3].Text?.Trim() ?? string.Empty;
                    var email = sheet.Cells[row, 4].Text?.Trim() ?? string.Empty;

                    if (string.IsNullOrWhiteSpace(name) &&
                        string.IsNullOrWhiteSpace(surname) &&
                        string.IsNullOrWhiteSpace(username) &&
                        string.IsNullOrWhiteSpace(email))
                    {
                        continue;
                    }

                    var passwordText = sheet.Cells[row, 5].Text?.Trim();
                    var confirmPasswordText = sheet.Cells[row, 6].Text?.Trim();
                    var roleText = sheet.Cells[row, 7].Text?.Trim();

                    var password = string.IsNullOrWhiteSpace(passwordText) ? "Admin123!" : passwordText;
                    var confirmPassword = string.IsNullOrWhiteSpace(confirmPasswordText) ? password : confirmPasswordText;
                    var role = string.IsNullOrWhiteSpace(roleText) ? "Client" : roleText;

                    rows.Add(new UserImportDto
                    {
                        Name = name,
                        Surname = surname,
                        Username = username,
                        Email = email,
                        Password = password,
                        ConfirmPassword = confirmPassword,
                        Role = role,
                        ExperienceLevel = sheet.Cells[row, 8].Text?.Trim(),
                        HourlyRate = decimal.TryParse(sheet.Cells[row, 9].Text?.Trim(), out var hr) ? hr : null,
                        Bio = sheet.Cells[row, 10].Text?.Trim(),
                        Industry = sheet.Cells[row, 11].Text?.Trim(),
                        Budget = decimal.TryParse(sheet.Cells[row, 12].Text?.Trim(), out var budget) ? budget : null
                    });
                }
            }
            else
            {
                return Result<ImportResultDto>.Failure("Unsupported import format. Use csv, excel, or json.");
            }

            var summary = new ImportResultDto
            {
                TotalRows = rows.Count
            };

            foreach (var row in rows)
            {
                var password = string.IsNullOrWhiteSpace(row.Password)
                    ? "Admin123!"
                    : row.Password.Trim();

                var confirmPassword = string.IsNullOrWhiteSpace(row.ConfirmPassword)
                    ? password
                    : row.ConfirmPassword.Trim();

                var role = row.Role?.Trim();
                if (string.IsNullOrWhiteSpace(role))
                    role = "Client";

                if (role.Contains(","))
                    role = role.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(r => r.Trim())
                               .FirstOrDefault() ?? "Client";

                var createResult = await CreateUserByAdminAsync(new CreateUserByAdminRequest
                {
                    Name = row.Name?.Trim() ?? string.Empty,
                    Surname = row.Surname?.Trim() ?? string.Empty,
                    Username = row.Username?.Trim() ?? string.Empty,
                    Email = row.Email?.Trim() ?? string.Empty,
                    Password = password,
                    ConfirmPassword = confirmPassword,
                    Role = role,
                    ExperienceLevel = row.ExperienceLevel?.Trim(),
                    HourlyRate = row.HourlyRate,
                    Bio = row.Bio?.Trim(),
                    Industry = row.Industry?.Trim(),
                    Budget = row.Budget
                });

                if (createResult.IsSuccess)
                {
                    summary.ImportedRows++;
                }
                else
                {
                    summary.FailedRows++;
                    var identifier = !string.IsNullOrWhiteSpace(row.Username)
                        ? row.Username
                        : row.Email ?? "Unknown user";

                    summary.Errors.Add($"{identifier}: {createResult.Error}");
                }
            }

            return Result<ImportResultDto>.Success(summary);
        }

        public Guid UserId
        {
            get
            {
                var claim = _user?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(claim, out var id)
                    ? id
                    : throw new UnauthorizedAccessException("User is not authenticated.");
            }
        }

        public string? Username => _user?.FindFirstValue(ClaimTypes.Name);
        public string? ProfileType => _user?.FindFirstValue("profileType");
        public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

        public async Task<UserProfileDto?> GetCurrentUserProfileAsync() =>
            await GetUserByIdAsync(UserId);

        public async Task<UserProfileDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserID == userId && u.Is_Active);

            if (user is null) return null;

            var freelancerSkills = user.FreelancerProfile is null
                ? new List<string>()
                : await _db.FreelancerSkills
                    .Where(fs => fs.FreelancerID == user.FreelancerProfile.FreelancerID)
                    .Select(fs => fs.Skill.Name)
                    .ToListAsync();

            return new UserProfileDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                ProfilePhoto = user.Profile_Photo,
                Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),

                FreelancerProfile = user.FreelancerProfile is null ? null : new FreelancerProfileDto
                {
                    ExperienceLevel = user.FreelancerProfile.Experience_Level,
                    HourlyRate = user.FreelancerProfile.Hourly_Rate,
                    Skills = freelancerSkills
                },

                ClientProfile = user.ClientProfile is null ? null : new ClientProfileDto
                {
                    Bio = user.ClientProfile.Bio,
                    Industry = user.ClientProfile.Industry,
                    Budget = user.ClientProfile.Budget
                }
            };
        }

        public async Task<Result<UserProfileDto>> UpdateCurrentUserAsync(UpdateUserRequest request)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .FirstOrDefaultAsync(u => u.UserID == UserId && u.Is_Active);

            if (user is null)
                return Result<UserProfileDto>.NotFound("User not found.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.UserID != user.UserID &&
                !u.Is_Deleted &&
                u.Username == request.Username);

            if (usernameExists)
                return Result<UserProfileDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.UserID != user.UserID &&
                !u.Is_Deleted &&
                u.Email == request.Email);

            if (emailExists)
                return Result<UserProfileDto>.Failure("Email is already taken.");

            user.Name = request.Name;
            user.Surname = request.Surname;
            user.Username = request.Username;
            user.Email = request.Email;
            user.Profile_Photo = request.ProfilePhoto;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var dto = await GetUserByIdAsync(user.UserID);
            return Result<UserProfileDto>.Success(dto!);
        }

        public async Task<Result<List<string>>> UpdateFreelancerSkillsAsync(UpdateFreelancerSkillsRequest request)
        {
            var freelancer = await _db.FreelancerProfiles
                .FirstOrDefaultAsync(fp => fp.UserID == UserId);

            if (freelancer is null)
                return Result<List<string>>.Forbidden("Only freelancers can manage skills.");

            var validSkillIds = await _db.Skills
                .Where(s => request.SkillIds.Contains(s.SkillsID))
                .Select(s => s.SkillsID)
                .ToListAsync();

            var existing = await _db.FreelancerSkills
                .Where(fs => fs.FreelancerID == freelancer.FreelancerID)
                .ToListAsync();

            _db.FreelancerSkills.RemoveRange(existing);

            var newEntries = validSkillIds.Select(sid => new Domain.Entities.FreelancerSkills
            {
                FreelancerSkillsID = Guid.NewGuid(),
                FreelancerID = freelancer.FreelancerID,
                SkillID = sid,
                Level = "General"
            });

            await _db.FreelancerSkills.AddRangeAsync(newEntries);
            await _db.SaveChangesAsync();

            var skillNames = await _db.FreelancerSkills
                .Where(fs => fs.FreelancerID == freelancer.FreelancerID)
                .Select(fs => fs.Skill.Name)
                .ToListAsync();

            return Result<List<string>>.Success(skillNames);
        }

        // Soft delete usable from elsewhere in the app if you want
        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null)
                return false;

            if (user.Is_Deleted)
                return true;

            user.Is_Deleted = true;
            user.Is_Active = false;
            user.Deleted_At = DateTime.UtcNow;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<Result<PagedResult<UserListItemDto>>> GetAllUsersAsync(UserQueryParams query)
        {
            var q = _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                q = q.Where(u =>
                    u.Name.Contains(search) ||
                    u.Surname.Contains(search) ||
                    u.Username.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (query.IsActive.HasValue)
                q = q.Where(u => u.Is_Active == query.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(query.Role))
                q = q.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(u => u.Created_At)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => new UserListItemDto
                {
                    UserId = u.UserID,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    Email = u.Email,
                    IsActive = u.Is_Active,
                    CreatedAt = u.Created_At,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToListAsync();

            return Result<PagedResult<UserListItemDto>>.Success(new PagedResult<UserListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<UserListItemDto>> AdminUpdateUserAsync(Guid userId, AdminUpdateUserRequest request)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user is null)
                return Result<UserListItemDto>.Failure("User not found.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.UserID != userId &&
                !u.Is_Deleted &&
                u.Username == request.Username);

            if (usernameExists)
                return Result<UserListItemDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.UserID != userId &&
                !u.Is_Deleted &&
                u.Email == request.Email);

            if (emailExists)
                return Result<UserListItemDto>.Failure("Email is already taken.");

            user.Name = request.Name;
            user.Surname = request.Surname;
            user.Username = request.Username;
            user.Email = request.Email;
            user.Is_Active = request.IsActive;
            user.Updated_At = DateTime.UtcNow;

            var existingRoles = user.UserRoles.ToList();
            _db.UserRoles.RemoveRange(existingRoles);

            if (request.Roles.Any())
            {
                var roles = await _db.Roles
                    .Where(r => request.Roles.Contains(r.Name))
                    .ToListAsync();

                foreach (var roleItem in roles)
                {
                    _db.UserRoles.Add(new Domain.Entities.UserRole
                    {
                        UserRolesID = Guid.NewGuid(),
                        UserID = user.UserID,
                        RoleID = roleItem.RoleID,
                        Assigned_At = DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();

            var updatedUser = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstAsync(u => u.UserID == userId);

            return Result<UserListItemDto>.Success(new UserListItemDto
            {
                UserId = updatedUser.UserID,
                Name = updatedUser.Name,
                Surname = updatedUser.Surname,
                Username = updatedUser.Username,
                Email = updatedUser.Email,
                IsActive = updatedUser.Is_Active,
                CreatedAt = updatedUser.Created_At,
                Roles = updatedUser.UserRoles.Select(ur => ur.Role.Name).ToList()
            });
        }

        public async Task<Result<bool>> AdminDeleteUserAsync(Guid userId)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user is null)
                return Result<bool>.Failure("User not found.");

            if (user.Is_Deleted)
                return Result<bool>.Failure("User is already deleted.");

            user.Is_Deleted = true;
            user.Is_Active = false;
            user.Deleted_At = DateTime.UtcNow;
            user.Updated_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<PagedResult<UserListItemDto>>> GetReportableUsersAsync(UserQueryParams query)
        {
            var q = _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .Where(u => u.Is_Active)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                q = q.Where(u =>
                    u.Name.Contains(search) ||
                    u.Surname.Contains(search) ||
                    u.Username.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Role))
                q = q.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(u => u.Username)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => new UserListItemDto
                {
                    UserId = u.UserID,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    Email = u.Email,
                    IsActive = u.Is_Active,
                    CreatedAt = u.Created_At,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToListAsync();

            return Result<PagedResult<UserListItemDto>>.Success(new PagedResult<UserListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<UserListItemDto>> CreateUserByAdminAsync(CreateUserByAdminRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword) ||
                string.IsNullOrWhiteSpace(request.Role))
            {
                return Result<UserListItemDto>.Failure("All required fields must be provided.");
            }

            if (request.Password != request.ConfirmPassword)
                return Result<UserListItemDto>.Failure("Passwords do not match.");

            if (request.Role != "Admin" && request.Role != "Client" && request.Role != "Freelancer")
                return Result<UserListItemDto>.Failure("Invalid role.");

            var usernameExists = await _db.Users.AnyAsync(u =>
                u.Username == request.Username &&
                !u.Is_Deleted);

            if (usernameExists)
                return Result<UserListItemDto>.Failure("Username is already taken.");

            var emailExists = await _db.Users.AnyAsync(u =>
                u.Email == request.Email &&
                !u.Is_Deleted);

            if (emailExists)
                return Result<UserListItemDto>.Failure("Email is already taken.");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);

            if (role is null)
                return Result<UserListItemDto>.Failure($"Role '{request.Role}' does not exist.");

            var user = new Domain.Entities.User
            {
                UserID = Guid.NewGuid(),
                Name = request.Name,
                Surname = request.Surname,
                Username = request.Username,
                Email = request.Email,
                Password_Hash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Is_Active = true,
                Created_At = DateTime.UtcNow,
                Updated_At = DateTime.UtcNow
            };

            _db.Users.Add(user);

            _db.UserRoles.Add(new Domain.Entities.UserRole
            {
                UserRolesID = Guid.NewGuid(),
                UserID = user.UserID,
                RoleID = role.RoleID,
                Assigned_At = DateTime.UtcNow
            });

            if (request.Role == "Client")
            {
                _db.ClientProfiles.Add(new Domain.Entities.ClientProfile
                {
                    ClientID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Bio = request.Bio ?? string.Empty,
                    Industry = request.Industry ?? string.Empty,
                    Budget = request.Budget ?? 0
                });
            }
            else if (request.Role == "Freelancer")
            {
                _db.FreelancerProfiles.Add(new Domain.Entities.FreelancerProfile
                {
                    FreelancerID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Experience_Level = request.ExperienceLevel ?? string.Empty,
                    Hourly_Rate = request.HourlyRate ?? 0
                });
            }

            await _db.SaveChangesAsync();

            return Result<UserListItemDto>.Success(new UserListItemDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.Is_Active,
                CreatedAt = user.Created_At,
                Roles = new List<string> { request.Role }
            });
        }
    }
}