using LabCourse2.Application.DTOs.AI;

namespace LabCourse2.Application.Interfaces.AI
{
    public interface IAIMatchingPredictionService
    {
        Task<MatchPredictionResponse?> PredictAsync(MatchPredictionRequest request);
    }
}