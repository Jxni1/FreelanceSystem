namespace LabCourse2.Application.DTOs.Reviews
{
    public class ReviewResponse
    {
        public Guid ReviewsID { get; init; }
        public string Comment { get; init; } = string.Empty;
        public int Rating { get; init; }
        public DateTime Created_at { get; init; }
        public Guid ContractID { get; init; }
        public Guid FreelancerID { get; init; }
        public string FreelancerName { get; init; } = string.Empty;
        public Guid ClientID { get; init; }
        public string ClientName { get; init; } = string.Empty;
    }
}
