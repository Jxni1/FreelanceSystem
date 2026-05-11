using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.ClientProfiles;
using LabCourse2.Application.DTOs.Projects;

namespace LabCourse2.Application.Interfaces
{
    public interface IClientService
    {
        Task<Result<PagedResult<ClientResponse>>> GetAllAsync(ClientQueryParams query);
        Task<Result<ClientResponse>> GetByIdAsync(Guid clientId);
        Task<Result<List<ClientProjectListResponse>>> GetProjectsByClientIdAsync(Guid clientId);
    }
}