using LabCourse2.Application.DTOs.Reviews;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class ReviewMappingExtensions
    {
        public static ReviewResponse ToResponse(this Review review) =>
            new()
            {
                ReviewsID = review.ReviewsID,
                Comment = review.Comment,
                Rating = review.Rating,
                Created_at = review.Created_at,
                ContractID = review.ContractID,
                FreelancerID = review.FreelancerID,
                FreelancerName = review.Freelancer?.User?.Username ?? string.Empty,
                ClientID = review.ClientID,
                ClientName = review.Client?.User?.Username ?? string.Empty
            };
    }
}
