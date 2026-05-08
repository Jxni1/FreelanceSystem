using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Reviews;
using LabCourse2.Application.Interfaces.Reviews;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Reviews
{
    public class ReviewService : IReviewService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public ReviewService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ReviewResponse>>> GetAllAsync(ReviewQueryParams query)
        {
            var q = _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .AsNoTracking()
                .AsQueryable();

            if (query.FreelancerID.HasValue)
                q = q.Where(r => r.FreelancerID == query.FreelancerID.Value);

            if (query.ContractID.HasValue)
                q = q.Where(r => r.ContractID == query.ContractID.Value);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(r => r.Created_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return Result<PagedResult<ReviewResponse>>.Success(new PagedResult<ReviewResponse>
            {
                Items = items.Select(r => r.ToResponse()),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<ReviewResponse>> GetByIdAsync(Guid id)
        {
            var review = await _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewsID == id);

            if (review is null)
                return Result<ReviewResponse>.NotFound($"Review with ID {id} was not found.");

            return Result<ReviewResponse>.Success(review.ToResponse());
        }

        public async Task<Result<ReviewResponse>> CreateAsync(CreateReviewRequest request)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ReviewResponse>.Forbidden("Only clients can leave reviews.");

            var contract = await _context.Contracts
                .FirstOrDefaultAsync(c => c.ContractID == request.ContractID);

            if (contract is null)
                return Result<ReviewResponse>.NotFound($"Contract with ID {request.ContractID} was not found.");

            if (contract.ClientID != client.ClientID)
                return Result<ReviewResponse>.Forbidden("You are not the client on this contract.");

            if (contract.Status != ContractStatus.Completed)
                return Result<ReviewResponse>.Failure("Reviews can only be submitted for completed contracts.");

            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.ContractID == request.ContractID && r.ClientID == client.ClientID);

            if (alreadyReviewed)
                return Result<ReviewResponse>.Conflict("You have already reviewed this contract.");

            var review = new Review
            {
                ReviewsID = Guid.NewGuid(),
                Comment = request.Comment,
                Rating = request.Rating,
                Created_at = DateTime.UtcNow,
                ContractID = request.ContractID,
                FreelancerID = contract.FreelancerID,
                ClientID = client.ClientID
            };

            await _context.Reviews.AddAsync(review);
            await _context.SaveChangesAsync();

            var created = await _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewsID == review.ReviewsID);

            return Result<ReviewResponse>.Created(created!.ToResponse());
        }
    }
}
