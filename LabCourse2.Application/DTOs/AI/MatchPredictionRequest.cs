namespace LabCourse2.Application.DTOs.AI
{
    public class MatchPredictionRequest
    {
        public string FreelancerText { get; set; } = string.Empty;
        public string ProjectText { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = "Unknown";
        public double HourlyRate { get; set; }
        public double ProjectBudget { get; set; }
        public int CategoryMatch { get; set; }
        public double SkillOverlap { get; set; }
        public double SkillLevelScore { get; set; }
        public double ProposalBidRatio { get; set; }
        public int DeliveryDays { get; set; }
    }
}