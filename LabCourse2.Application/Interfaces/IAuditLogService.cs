using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.AuditLogs;

namespace LabCourse2.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task LogAsync(
            string action,
            string entity,
            string? oldValue,
            string? newValue,
            Guid entityId,
            Guid userId,
            string? ipAddress = null);

        Task<Result<PagedResult<AuditLogResponse>>> GetAllAsync(AuditLogQueryParams query);
    }
}