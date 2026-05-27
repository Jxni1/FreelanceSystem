namespace LabCourse2.Application.DTOs.AI
{
    public class FreelancerExportRow
    {
        public Guid FreelancerId { get; set; }
        public Guid UserId { get; set; }
        public string ExperienceLevel { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public string SkillsText { get; set; } = string.Empty;
        public string SkillLevelsText { get; set; } = string.Empty;
        public string FreelancerText { get; set; } = string.Empty;
    }
}