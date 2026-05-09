using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Application.DTOs.Proposals;

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
    }
}
