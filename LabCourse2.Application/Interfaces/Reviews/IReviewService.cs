using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Reviews;

namespace LabCourse2.Application.Interfaces.Reviews
{
    public interface IReviewService
    {
        Task<Result<PagedResult<ReviewResponse>>> GetAllAsync(ReviewQueryParams query);
        Task<Result<ReviewResponse>> GetByIdAsync(Guid id);
        Task<Result<ReviewResponse>> CreateAsync(CreateReviewRequest request);
        Task<Result<ReviewResponse>> UpdateAsync(Guid id, UpdateReviewRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}