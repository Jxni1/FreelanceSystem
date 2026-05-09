using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Settings;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services
{
    public class SettingService : ISettingService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public SettingService(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PagedResult<SettingResponse>>> GetAllSettingsAsync(SettingQueryParams query)
        {
            try
            {
                var q = _context.Settings.AsQueryable();

                if (!string.IsNullOrWhiteSpace(query.Search))
                {
                    var search = query.Search.ToLower();
                    q = q.Where(s => s.Key.ToLower().Contains(search) || 
                                     s.Value.ToLower().Contains(search) ||
                                     (s.Description != null && s.Description.ToLower().Contains(search)));
                }

                var totalCount = await q.CountAsync();
                var items = await q
                    .OrderByDescending(s => s.UpdatedAt)
                    .Skip((query.Page - 1) * query.PageSize)
                    .Take(query.PageSize)
                    .Select(s => new SettingResponse
                    {
                        SettingID = s.SettingID,
                        Key = s.Key,
                        Value = s.Value,
                        Description = s.Description,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt,
                        CreatedBy = s.CreatedBy,
                        UpdatedBy = s.UpdatedBy
                    })
                    .ToListAsync();

                var result = new PagedResult<SettingResponse>
                {
                    Items = items,
                    TotalCount = totalCount,
                    Page = query.Page,
                    PageSize = query.PageSize
                };

                return Result<PagedResult<SettingResponse>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PagedResult<SettingResponse>>.Failure($"Error retrieving settings: {ex.Message}");
            }
        }

        public async Task<Result<SettingResponse>> GetSettingByKeyAsync(string key)
        {
            try
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.Key == key);

                if (setting is null)
                    return Result<SettingResponse>.Failure($"Setting with key '{key}' not found.");

                var response = new SettingResponse
                {
                    SettingID = setting.SettingID,
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    CreatedAt = setting.CreatedAt,
                    UpdatedAt = setting.UpdatedAt,
                    CreatedBy = setting.CreatedBy,
                    UpdatedBy = setting.UpdatedBy
                };

                return Result<SettingResponse>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<SettingResponse>.Failure($"Error retrieving setting: {ex.Message}");
            }
        }

        public async Task<Result<SettingResponse>> GetSettingByIdAsync(Guid id)
        {
            try
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.SettingID == id);

                if (setting is null)
                    return Result<SettingResponse>.Failure($"Setting not found.");

                var response = new SettingResponse
                {
                    SettingID = setting.SettingID,
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    CreatedAt = setting.CreatedAt,
                    UpdatedAt = setting.UpdatedAt,
                    CreatedBy = setting.CreatedBy,
                    UpdatedBy = setting.UpdatedBy
                };

                return Result<SettingResponse>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<SettingResponse>.Failure($"Error retrieving setting: {ex.Message}");
            }
        }

        public async Task<Result<SettingResponse>> CreateSettingAsync(CreateSettingRequest request)
        {
            try
            {
                var existingSetting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.Key == request.Key);

                if (existingSetting is not null)
                    return Result<SettingResponse>.Failure($"Setting with key '{request.Key}' already exists.");

                var userId = _currentUserService.UserId != Guid.Empty ? _currentUserService.UserId.ToString() : null;

                var setting = new Setting
                {
                    SettingID = Guid.NewGuid(),
                    Key = request.Key,
                    Value = request.Value,
                    Description = request.Description,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = userId,
                    UpdatedBy = userId
                };

                _context.Settings.Add(setting);
                await _context.SaveChangesAsync();

                var response = new SettingResponse
                {
                    SettingID = setting.SettingID,
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    CreatedAt = setting.CreatedAt,
                    UpdatedAt = setting.UpdatedAt,
                    CreatedBy = setting.CreatedBy,
                    UpdatedBy = setting.UpdatedBy
                };

                return Result<SettingResponse>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<SettingResponse>.Failure($"Error creating setting: {ex.Message}");
            }
        }

        public async Task<Result<SettingResponse>> UpdateSettingAsync(Guid id, UpdateSettingRequest request)
        {
            try
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.SettingID == id);

                if (setting is null)
                    return Result<SettingResponse>.Failure("Setting not found.");

                var userId = _currentUserService.UserId != Guid.Empty ? _currentUserService.UserId.ToString() : null;

                setting.Value = request.Value;
                setting.Description = request.Description;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedBy = userId;

                _context.Settings.Update(setting);
                await _context.SaveChangesAsync();

                var response = new SettingResponse
                {
                    SettingID = setting.SettingID,
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    CreatedAt = setting.CreatedAt,
                    UpdatedAt = setting.UpdatedAt,
                    CreatedBy = setting.CreatedBy,
                    UpdatedBy = setting.UpdatedBy
                };

                return Result<SettingResponse>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<SettingResponse>.Failure($"Error updating setting: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteSettingAsync(Guid id)
        {
            try
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.SettingID == id);

                if (setting is null)
                    return Result<bool>.Failure("Setting not found.");

                _context.Settings.Remove(setting);
                await _context.SaveChangesAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error deleting setting: {ex.Message}");
            }
        }

        public async Task<string?> GetSettingValueAsync(string key)
        {
            try
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.Key == key);

                return setting?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}