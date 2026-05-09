using LabCourse2.Application.DTOs.Settings;
using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class SettingsController : BaseApiController
    {
        private readonly ISettingService _settingService;

        public SettingsController(ISettingService settingService)
        {
            _settingService = settingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSettings([FromQuery] SettingQueryParams query)
        {
            var result = await _settingService.GetAllSettingsAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetSettingById(Guid id)
        {
            var result = await _settingService.GetSettingByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpGet("key/{key}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSettingByKey(string key)
        {
            var result = await _settingService.GetSettingByKeyAsync(key);
            return ToActionResult(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSetting([FromBody] CreateSettingRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            var result = await _settingService.CreateSettingAsync(request);
            return ToActionResult(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateSetting(Guid id, [FromBody] UpdateSettingRequest request)
        {
            if (request is null)
                return BadRequest("Request body is required.");

            var result = await _settingService.UpdateSettingAsync(id, request);
            return ToActionResult(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteSetting(Guid id)
        {
            var result = await _settingService.DeleteSettingAsync(id);
            return ToActionResult(result);
        }
    }
}