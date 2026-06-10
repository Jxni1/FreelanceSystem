using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Application.DTOs.Users;
using Microsoft.AspNetCore.Http;

namespace LabCourse2.Application.Interfaces.Proposals
{
    public interface IProposalService
    {
        Task<Result<PagedResult<ProposalResponse>>> GetAllAsync(ProposalQueryParams query);
        Task<Result<ProposalResponse>> GetByIdAsync(Guid id);
        Task<Result<ProposalResponse>> CreateAsync(CreateProposalRequest request);
        Task<Result<ContractResponse>> AcceptAsync(Guid proposalId);
        Task<Result<ProposalResponse>> RejectAsync(Guid proposalId);
        Task<Result<bool>> DeleteAsync(Guid id);
        Task<Result<FileExportResultDto>> ExportProposalsAsync(ProposalQueryParams query, string format);
        Task<Result<ImportResultDto>> ImportProposalsAsync(IFormFile file, string format);
    }
}