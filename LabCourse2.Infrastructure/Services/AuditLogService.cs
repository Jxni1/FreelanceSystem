using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.AuditLogs;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Net.Sockets;

namespace LabCourse2.Infrastructure.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(IAppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(
            string action,
            string entity,
            string? oldValue,
            string? newValue,
            Guid entityId,
            Guid userId,
            string? ipAddress = null)
        {
            try
            {
                var ip = ipAddress ?? GetIpAddress();

                _context.Audit_Logs.Add(new Audit_Logs
                {
                    Audit_LogsID = Guid.NewGuid(),
                    Action = action,
                    Entity = entity,
                    old_values = oldValue ?? string.Empty,
                    new_values = newValue ?? string.Empty,
                    IPaddress = ParseIpToInt(ip),
                    Created_at = DateTime.UtcNow,
                    EntityID = Math.Abs(entityId.GetHashCode()),
                    UserID = userId
                });

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // TEMP: remove after debugging
                throw;
            }
        }

        public async Task<Result<PagedResult<AuditLogResponse>>> GetAllAsync(AuditLogQueryParams query)
        {
            var q = _context.Audit_Logs
                .Include(a => a.User)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Action))
                q = q.Where(a => a.Action == query.Action);

            if (!string.IsNullOrWhiteSpace(query.Entity))
                q = q.Where(a => a.Entity == query.Entity);

            if (query.From.HasValue)
                q = q.Where(a => a.Created_at >= query.From.Value);

            if (query.To.HasValue)
                q = q.Where(a => a.Created_at <= query.To.Value);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(a => a.Created_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(a => new AuditLogResponse
                {
                    AuditLogId = a.Audit_LogsID,
                    Action = a.Action,
                    Entity = a.Entity,
                    OldValue = string.IsNullOrEmpty(a.old_values) ? null : a.old_values,
                    NewValue = string.IsNullOrEmpty(a.new_values) ? null : a.new_values,
                    IpAddress = a.IPaddress != 0
                        ? $"{(a.IPaddress >> 24) & 0xFF}.{(a.IPaddress >> 16) & 0xFF}.{(a.IPaddress >> 8) & 0xFF}.{a.IPaddress & 0xFF}"
                        : null,
                    CreatedAt = a.Created_at,
                    UserId = a.UserID,
                    Username = a.User.Username
                })
                .ToListAsync();

            return Result<PagedResult<AuditLogResponse>>.Success(new PagedResult<AuditLogResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        private string? GetIpAddress()
        {
            var ctx = _httpContextAccessor.HttpContext;
            if (ctx is null) return null;

            var forwarded = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwarded))
                return forwarded.Split(',')[0].Trim();

            return ctx.Connection.RemoteIpAddress?.ToString();
        }

        private static int ParseIpToInt(string? ip)
        {
            if (string.IsNullOrWhiteSpace(ip)) return 0;
            if (System.Net.IPAddress.TryParse(ip, out var parsed) &&
                parsed.AddressFamily == AddressFamily.InterNetwork)
            {
                var b = parsed.GetAddressBytes();
                return (b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3];
            }
            return 0;
        }
    }
}