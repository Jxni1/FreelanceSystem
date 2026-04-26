using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;

namespace LabCourse2.Application.Interfaces.Contracts
{
    public interface IContractService
    {
        Task<Result<PagedResult<ContractResponse>>> GetAllAsync(ContractQueryParams query); // Superadmin only
        Task<Result<PagedResult<ContractResponse>>> GetContractsByClientIDAsync(ContractQueryParams query); // Client users
        Task<Result<PagedResult<ContractResponse>>> GetContractsByFreelancerIDAsync(ContractQueryParams query); // Freelancer users
        Task<Result<ContractResponse>> GetByIdAsync(Guid id);
        Task<Result<ContractResponse>> CreateAsync(CreateContractRequest request);
        Task<Result<ContractResponse>> UpdateAsync(Guid id, UpdateContractRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}
