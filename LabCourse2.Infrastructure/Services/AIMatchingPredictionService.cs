using System.Net.Http.Json;
using LabCourse2.Application.DTOs.AI;
using LabCourse2.Application.Interfaces.AI;

namespace LabCourse2.Infrastructure.Services
{
    public class AIMatchingPredictionService : IAIMatchingPredictionService
    {
        private readonly HttpClient _httpClient;

        public AIMatchingPredictionService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<MatchPredictionResponse?> PredictAsync(MatchPredictionRequest request)
        {
            var response = await _httpClient.PostAsJsonAsync("/predict", request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Python AI API error: {error}");
            }

            return await response.Content.ReadFromJsonAsync<MatchPredictionResponse>();
        }
    }
}