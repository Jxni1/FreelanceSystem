using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class ReportMappingExtensions
    {
        public static ReportResponse ToResponse(this Report report)
        {
            return new ReportResponse
            {
                ReportsID = report.ReportsID,
                Entity = report.Entity,
                EntityID = report.EntityID,
                Reason = report.Reason,
                Status = report.Status,
                Created_at = report.Created_at,
                Created_by = report.Created_by,
                Updated_at = report.Updated_at,
                Updated_by = report.Updated_by,
                UserID = report.UserID
            };
        }

        public static Report ToEntity(this CreateReportRequest request)
        {
            return new Report
            {
                ReportsID = Guid.NewGuid(),
                Entity = request.Entity,
                EntityID = request.EntityID,
                Reason = request.Reason,
                Status = "Pending",
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow
            };
        }
    }
}