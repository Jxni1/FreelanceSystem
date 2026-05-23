using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Application.DTOs.Users;
using Microsoft.AspNetCore.Http;

namespace LabCourse2.Application.Interfaces.Reports
{
    public interface IReportService
    {
        Task<Result<PagedResult<ReportResponse>>> GetAllAsync(ReportQueryParams query);
        Task<Result<ReportResponse>> GetByIdAsync(Guid reportId);
        Task<Result<ReportResponse>> CreateAsync(CreateReportRequest request);
        Task<Result<ReportResponse>> UpdateStatusAsync(Guid reportId, UpdateReportStatusRequest request);
        Task<Result<bool>> DeleteAsync(Guid reportId);

        Task<Result<FileExportResultDto>> ExportReportsAsync(ReportQueryParams query, string format);
        Task<Result<ImportResultDto>> ImportReportsAsync(IFormFile file, string format);
    }
}