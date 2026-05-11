using System.Security.Claims;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.FavoriteFreelancers;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public class FavoriteFreelancerService : IFavoriteFreelancerService
    {
        private readonly IAppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FavoriteFreelancerService(
            IAppDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid? GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;

            var userIdValue =
                user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                user?.FindFirst("sub")?.Value ??
                user?.FindFirst("id")?.Value;

            return Guid.TryParse(userIdValue, out var userId) ? userId : null;
        }

        private async Task<ClientProfile?> GetCurrentClientAsync()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return null;

            return await _context.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserID == userId.Value);
        }

        public async Task<Result<List<FavoriteFreelancerResponse>>> GetMineAsync()
        {
            var client = await GetCurrentClientAsync();
            if (client == null)
                return Result<List<FavoriteFreelancerResponse>>.Failure("Client profile not found.");

            var favorites = await _context.Favorite_Freelancers
                .Where(ff => ff.ClientID == client.ClientID)
                .Select(ff => new FavoriteFreelancerResponse
                {
                    FavoriteFreelancerID = ff.Favorite_FreelancerID,
                    FreelancerID = ff.Freelancer.FreelancerID,
                    Name = ff.Freelancer.User.Name,
                    Username = ff.Freelancer.User.Username,
                    ExperienceLevel = ff.Freelancer.Experience_Level,
                    HourlyRate = ff.Freelancer.Hourly_Rate,
                    ReviewCount = ff.Freelancer.Reviews.Count,
                    AverageRating = ff.Freelancer.Reviews.Any()
                        ? ff.Freelancer.Reviews.Average(r => r.Rating)
                        : 0,
                    Skills = _context.FreelancerSkills
                        .Where(fs => fs.FreelancerID == ff.FreelancerID)
                        .Select(fs => fs.Skill.Name)
                        .ToList()
                })
                .ToListAsync();

            return Result<List<FavoriteFreelancerResponse>>.Success(favorites);
        }

        public async Task<Result<string>> AddAsync(Guid freelancerId)
        {
            var client = await GetCurrentClientAsync();
            if (client == null)
                return Result<string>.Failure("Client profile not found.");

            var freelancerExists = await _context.FreelancerProfiles
                .AnyAsync(f => f.FreelancerID == freelancerId);

            if (!freelancerExists)
                return Result<string>.Failure("Freelancer not found.");

            var alreadyExists = await _context.Favorite_Freelancers
                .AnyAsync(ff => ff.ClientID == client.ClientID && ff.FreelancerID == freelancerId);

            if (alreadyExists)
                return Result<string>.Failure("Freelancer is already in favorites.");

            var favorite = new Favorite_Freelancer
            {
                Favorite_FreelancerID = Guid.NewGuid(),
                ClientID = client.ClientID,
                FreelancerID = freelancerId
            };

            _context.Favorite_Freelancers.Add(favorite);
            await _context.SaveChangesAsync(CancellationToken.None);

            return Result<string>.Success("Freelancer added to favorites.");
        }

        public async Task<Result<string>> RemoveAsync(Guid freelancerId)
        {
            var client = await GetCurrentClientAsync();
            if (client == null)
                return Result<string>.Failure("Client profile not found.");

            var favorite = await _context.Favorite_Freelancers
                .FirstOrDefaultAsync(ff =>
                    ff.ClientID == client.ClientID &&
                    ff.FreelancerID == freelancerId);

            if (favorite == null)
                return Result<string>.Failure("Favorite freelancer not found.");

            _context.Favorite_Freelancers.Remove(favorite);
            await _context.SaveChangesAsync(CancellationToken.None);

            return Result<string>.Success("Freelancer removed from favorites.");
        }
    }
}