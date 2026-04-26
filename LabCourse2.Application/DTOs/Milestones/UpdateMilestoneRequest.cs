
namespace LabCourse2.Application.DTOs.Milestones
{
    public class UpdateMilestoneRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
