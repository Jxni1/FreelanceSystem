using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Settings;

namespace LabCourse2.Application.Interfaces
{
    public interface ISettingService
    {
        Task<Result<PagedResult<SettingResponse>>> GetAllSettingsAsync(SettingQueryParams query);
        Task<Result<SettingResponse>> GetSettingByKeyAsync(string key);
        Task<Result<SettingResponse>> GetSettingByIdAsync(Guid id);
        Task<Result<SettingResponse>> CreateSettingAsync(CreateSettingRequest request);
        Task<Result<SettingResponse>> UpdateSettingAsync(Guid id, UpdateSettingRequest request);
        Task<Result<bool>> DeleteSettingAsync(Guid id);
        Task<string?> GetSettingValueAsync(string key);
    }
}