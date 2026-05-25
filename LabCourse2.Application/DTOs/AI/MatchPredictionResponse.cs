namespace LabCourse2.Application.DTOs.AI
{
    public class MatchPredictionResponse
    {
        public int Prediction { get; set; }
        public double MatchScore { get; set; }
        public double CosineSimilarity { get; set; }
    }
}