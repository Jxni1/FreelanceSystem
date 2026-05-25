namespace LabCourse2.Application.DTOs.AI
{
    public class RecommendedProjectDto
    {
        public Guid ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public double MatchScore { get; set; }
        public double CosineSimilarity { get; set; }
        public int Prediction { get; set; }
    }
}