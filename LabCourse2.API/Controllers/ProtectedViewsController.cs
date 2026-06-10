using LabCourse2.Application.DTOs.ProtectedViews;
using LabCourse2.Application.Interfaces.ProtectedViews;
using LabCourse2.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    [Route("api/protected-views")]   
    public class ProtectedViewsController : BaseApiController
    {
        private readonly IProtectedViewService _service;

        public ProtectedViewsController(IProtectedViewService service)
        {
            _service = service;
        }

        [HttpPost("log/{projectId:guid}")]
        public async Task<IActionResult> LogView(Guid projectId)
        {
            var result = await _service.LogViewAsync(projectId);
            return ToActionResult(result);
        }

        [HttpGet("project/{projectId:guid}")]
        public async Task<IActionResult> GetProjectViews(Guid projectId, [FromQuery] ProtectedViewQueryParams query)
        {
            var result = await _service.GetProjectViewsAsync(projectId, query);
            return ToActionResult(result);
        }

        [HttpGet("project/{projectId:guid}/stats")]
        public async Task<IActionResult> GetProjectStats(Guid projectId)
        {
            var result = await _service.GetProjectStatsAsync(projectId);
            return ToActionResult(result);
        }

        [HttpGet("most-viewed")]
        [HasPermission("protectedviews.manage")]
        public async Task<IActionResult> GetMostViewed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _service.GetMostViewedProjectsAsync(page, pageSize);
            return ToActionResult(result);
        }

        [HttpGet("suspicious")]
        [HasPermission("protectedviews.manage")]
        public async Task<IActionResult> GetSuspiciousActivity([FromQuery] ProtectedViewQueryParams query)
        {
            var result = await _service.GetSuspiciousActivityAsync(query);
            return ToActionResult(result);
        }
    }
}