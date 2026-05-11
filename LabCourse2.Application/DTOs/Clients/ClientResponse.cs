namespace LabCourse2.Application.DTOs.ClientProfiles
{
    public class ClientResponse
    {
        public Guid ClientID { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Bio { get; init; } = string.Empty;
        public string Industry { get; init; } = string.Empty;
        public decimal Budget { get; init; }
        public double AverageRating { get; init; }
        public int ReviewCount { get; init; }
    }
}