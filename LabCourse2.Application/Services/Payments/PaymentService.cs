using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Payments;
using LabCourse2.Application.Interfaces.Payments;
using LabCourse2.Application.Mappings;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public PaymentService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        private async Task<bool> CanAccessContractAsync(Guid contractId)
        {
            var client = await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

            if (client is not null)
                return await _context.Contracts
                    .AnyAsync(c => c.ContractID == contractId && c.ClientID == client.ClientID);

            var freelancer = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

            if (freelancer is not null)
                return await _context.Contracts
                    .AnyAsync(c => c.ContractID == contractId && c.FreelancerID == freelancer.FreelancerID);

            return false;
        }

        public async Task<Result<PagedResult<PaymentResponse>>> GetByContractAsync(
            Guid contractId, int page, int pageSize)
        {
            var contractExists = await _context.Contracts
                .AnyAsync(c => c.ContractID == contractId);

            if (!contractExists)
                return Result<PagedResult<PaymentResponse>>
                    .NotFound($"Contract with ID {contractId} was not found.");

            if (!await CanAccessContractAsync(contractId))
                return Result<PagedResult<PaymentResponse>>
                    .Forbidden("You are not a party to this contract.");

            var q = _context.Payments
                .Where(p => p.ContractID == contractId)
                .AsNoTracking();

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(p => p.Payment_Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Result<PagedResult<PaymentResponse>>.Success(new PagedResult<PaymentResponse>
            {
                Items = items.Select(p => p.ToResponse()),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task<Result<PaymentResponse>> GetByIdAsync(Guid id)
        {

            var minWithdrawalSetting = await _settingService.GetSettingValueAsync("min_withdrawal_amount");
    
            if (decimal.TryParse(minWithdrawalSetting, out var minAmount) && request.Amount < minAmount)
            {
                return Result<PaymentResponse>.Failure(
                 $"Minimum withdrawal amount is ${minAmount:F2}. Your amount must be at least this much."
                );
            }

            var payment = await _context.Payments
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            if (payment is null)
                return Result<PaymentResponse>.NotFound($"Payment with ID {id} was not found.");

            if (!await CanAccessContractAsync(payment.ContractID))
                return Result<PaymentResponse>.Forbidden("You are not a party to this contract.");

            return Result<PaymentResponse>.Success(payment.ToResponse());
        }
    }
}
