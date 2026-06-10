using LabCourse2.Application.DTOs.AuditLogs;
using LabCourse2.Application.Interfaces;
using LabCourse2.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [HasPermission("auditlogs.view")]
    public class AuditLogsController : BaseApiController
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] AuditLogQueryParams query)
        {
            var result = await _auditLogService.GetAllAsync(query);
            return ToActionResult(result);
        }
    }
}