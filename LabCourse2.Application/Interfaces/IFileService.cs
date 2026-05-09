using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Files;

namespace LabCourse2.Application.Interfaces.Files
{
    public interface IFileService
    {
        Task<Result<PagedResult<FileResponse>>> GetAllAsync(FileQueryParams query);

        Task<Result<FileResponse>> GetByIdAsync(Guid fileId);

        Task<Result<FileResponse>> UploadAsync(UploadFileRequest request);

        Task<Result<FileResponse>> UpdateAsync(Guid fileId, UpdateFileRequest request);

        Task<Result<bool>> DeleteAsync(Guid fileId);
    }
}