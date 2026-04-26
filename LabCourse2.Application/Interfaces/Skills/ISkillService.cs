using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Skills;

namespace LabCourse2.Application.Interfaces.Skills
{
    public interface ISkillService
    {
        Task<Result<PagedResult<SkillResponse>>> GetAllAsync(SkillQueryParams query);
        Task<Result<SkillResponse>> GetByIdAsync(Guid id);
        Task<Result<SkillResponse>> CreateAsync(CreateSkillRequest request);
        Task<Result<SkillResponse>> UpdateAsync(Guid id, UpdateSkillRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}