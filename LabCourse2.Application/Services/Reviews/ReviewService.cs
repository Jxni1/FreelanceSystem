using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Reviews;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Reviews;
using LabCourse2.Application.Mappings;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using LabCourse2.Application.Utilities;

namespace LabCourse2.Application.Services.Reviews
{
    public class ReviewService : IReviewService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly INotificationCreator _notificationCreator;

        public ReviewService(
            IAppDbContext context,
            ICurrentUserService currentUser,
            INotificationCreator notificationCreator)
        {
            _context = context;
            _currentUser = currentUser;
            _notificationCreator = notificationCreator;
        }

        private async Task<ClientProfile?> GetClientProfileAsync() =>
            await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == _currentUser.UserId);

        private async Task<FreelancerProfile?> GetFreelancerProfileAsync() =>
            await _context.FreelancerProfiles
                .FirstOrDefaultAsync(f => f.UserID == _currentUser.UserId);

        public async Task<Result<PagedResult<ReviewResponse>>> GetAllAsync(ReviewQueryParams query)
        {
            var q = _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .Include(r => r.Contract)
                .AsNoTracking()
                .AsQueryable();
 
            if (query.FreelancerID.HasValue)
                q = q.Where(r => r.FreelancerID == query.FreelancerID);

            if (query.ClientID.HasValue)
                q = q.Where(r => r.ClientID == query.ClientID);

            if (query.ContractID.HasValue)
                q = q.Where(r => r.ContractID == query.ContractID);
 
            q = q.FilterByRatingRange(query.MinRating, query.MaxRating);
 
            q = q.SearchReviews(query.SearchComment);

            var totalCount = await q.CountAsync();
 
            q = q.SortReviews(query.SortBy, query.SortOrder);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(r => r.ToResponse())
                .ToListAsync();

            return Result<PagedResult<ReviewResponse>>.Success(new PagedResult<ReviewResponse>
            {
                Items = items,
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
                .Include(c => c.Freelancer)
                    .ThenInclude(f => f.User)
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

            if (contract.Freelancer?.User?.UserID != null)
            {
                await _notificationCreator.CreateAsync(
                    contract.Freelancer.User.UserID,
                    "ReviewReceived",
                    "New review received",
                    "You received a new review on a completed contract.");
            }

            var created = await _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewsID == review.ReviewsID);

            return Result<ReviewResponse>.Created(created!.ToResponse());
        }

        public async Task<Result<ReviewResponse>> UpdateAsync(Guid id, UpdateReviewRequest request)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<ReviewResponse>.Forbidden("Only clients can update reviews.");

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewsID == id);

            if (review is null)
                return Result<ReviewResponse>.NotFound($"Review with ID {id} was not found.");

            if (review.ClientID != client.ClientID)
                return Result<ReviewResponse>.Forbidden("You can only update your own reviews.");

            review.Comment = request.Comment;
            review.Rating = request.Rating;

            await _context.SaveChangesAsync();

            var updated = await _context.Reviews
                .Include(r => r.Freelancer).ThenInclude(f => f.User)
                .Include(r => r.Client).ThenInclude(c => c.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewsID == id);

            return Result<ReviewResponse>.Success(updated!.ToResponse());
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var client = await GetClientProfileAsync();
            if (client is null)
                return Result<bool>.Forbidden("Only clients can delete reviews.");

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewsID == id);

            if (review is null)
                return Result<bool>.NotFound($"Review with ID {id} was not found.");

            if (review.ClientID != client.ClientID)
                return Result<bool>.Forbidden("You can only delete your own reviews.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}