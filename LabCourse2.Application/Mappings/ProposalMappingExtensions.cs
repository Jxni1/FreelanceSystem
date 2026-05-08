using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class ProposalMappingExtensions
    {
        public static ProposalResponse ToResponse(this Proposal proposal) =>
            new()
            {
                ProposalId = proposal.ProposalId,
                Message = proposal.Message,
                BidAmount = proposal.BidAmount,
                DeliveryDays = proposal.DeliveryDays,
                Status = proposal.Status,
                Created_at = proposal.Created_at,
                FreelancerId = proposal.FreelancerId,
                FreelancerName = proposal.Freelancer?.User?.Username ?? string.Empty,
                ProjectId = proposal.ProjectId,
                ProjectTitle = proposal.Project?.Title ?? string.Empty
            };

        public static Proposal ToEntity(this CreateProposalRequest request, Guid freelancerId) =>
            new()
            {
                ProposalId = Guid.NewGuid(),
                Message = request.Message,
                BidAmount = request.BidAmount,
                DeliveryDays = request.DeliveryDays,
                Status = ProposalStatus.Pending,
                FreelancerId = freelancerId,
                ProjectId = request.ProjectId
            };
    }
}
