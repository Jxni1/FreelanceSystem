using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.FavoriteFreelancers;

namespace LabCourse2.Application.Interfaces
{
    public interface IFavoriteFreelancerService
    {
        Task<Result<List<FavoriteFreelancerResponse>>> GetMineAsync();
        Task<Result<string>> AddAsync(Guid freelancerId);
        Task<Result<string>> RemoveAsync(Guid freelancerId);
    }
}