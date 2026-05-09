using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Freelancers;

namespace LabCourse2.Application.Interfaces
{
    public interface IFreelancerService
    {
        Task<Result<PagedResult<FreelancerResponse>>> GetAllAsync(FreelancerQueryParams query);
    }
}
