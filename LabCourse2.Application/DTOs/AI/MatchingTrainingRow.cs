namespace LabCourse2.Application.DTOs.AI
{
    public class MatchingTrainingRow
    {
        public Guid FreelancerId { get; set; }
        public Guid ProjectId { get; set; }
        public string FreelancerText { get; set; } = string.Empty;
        public string ProjectText { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public decimal ProjectBudget { get; set; }
        public int CategoryMatch { get; set; }
        public double SkillOverlap { get; set; }
        public double SkillLevelScore { get; set; }
        public double? ProposalBidRatio { get; set; }
        public int? DeliveryDays { get; set; }
        public int Label { get; set; }
    }
}