using LabCourse2.Application.DTOs.Contracts;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class ContractMappingExtensions
    {
        public static ContractResponse ToResponse(this Contract contract) =>
            new()
            {
                ContractID = contract.ContractID,
                Description = contract.Description,
                Start_Date = contract.Start_Date,
                End_Date = contract.End_Date,
                Price = contract.Price,
                Agreed_Price = contract.Agreed_Price,
                Status = contract.Status,
                ClientID = contract.ClientID,
                ClientName = contract.Client?.User?.Username ?? string.Empty,
                FreelancerID = contract.FreelancerID,
                FreelancerName = contract.Freelancer?.User?.Username ?? string.Empty,
                ProjectID = contract.ProjectID,
                ProjectTitle = contract.Project?.Title ?? string.Empty
            };

        public static Contract ToEntity(this CreateContractRequest request, Guid clientId) =>
            new()
            {
                ContractID = Guid.NewGuid(),
                Description = request.Description,
                Start_Date = request.Start_Date,
                End_Date = request.End_Date,
                Price = request.Price,
                Agreed_Price = request.Agreed_Price,
                Status = ContractStatus.Pending,
                ClientID = clientId,
                FreelancerID = request.FreelancerID,
                ProjectID = request.ProjectID
            };

        public static void ApplyUpdate(this Contract contract, UpdateContractRequest request)
        {
            contract.Description = request.Description;
            contract.Start_Date = request.Start_Date;
            contract.End_Date = request.End_Date;
            contract.Price = request.Price;
            contract.Agreed_Price = request.Agreed_Price;
            contract.Status = request.Status;
        }
    }
}
