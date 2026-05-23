using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Users;
using Microsoft.AspNetCore.Http;

namespace LabCourse2.Application.Interfaces.Contracts
{
    public interface IContractService
    {
        Task<Result<PagedResult<ContractResponse>>> GetAllAsync(ContractQueryParams query);
        Task<Result<PagedResult<ContractResponse>>> GetContractsByClientIDAsync(ContractQueryParams query);
        Task<Result<PagedResult<ContractResponse>>> GetContractsByFreelancerIDAsync(ContractQueryParams query);
        Task<Result<ContractResponse>> GetByIdAsync(Guid id);
        Task<Result<ContractResponse>> CreateAsync(CreateContractRequest request);
        Task<Result<ContractResponse>> UpdateAsync(Guid id, UpdateContractRequest request);
        Task<Result<bool>> DeleteAsync(Guid id);

        Task<Result<FileExportResultDto>> ExportContractsAsync(ContractQueryParams query, string format);
        Task<Result<ImportResultDto>> ImportContractsAsync(IFormFile file, string format);
    }
}