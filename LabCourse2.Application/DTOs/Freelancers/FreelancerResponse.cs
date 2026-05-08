namespace LabCourse2.Application.DTOs.Freelancers
{
    public class FreelancerResponse
    {
        public Guid FreelancerID { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string ExperienceLevel { get; init; } = string.Empty;
        public decimal HourlyRate { get; init; }
        public List<string> Skills { get; init; } = new();
        public double AverageRating { get; init; }
        public int ReviewCount { get; init; }
    }
}
