using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class PaymentMappingExtensions
    {
        public static PaymentResponse ToResponse(this Payment payment) =>
            new()
            {
                PaymentID = payment.PaymentID,
                PaymentMethod = payment.Payment_method,
                Status = payment.Status,
                PaymentDate = payment.Payment_Date,
                Amount = payment.Amount,
                ContractID = payment.ContractID,
                MilestoneID = payment.MilestoneID
            };
    }
}
