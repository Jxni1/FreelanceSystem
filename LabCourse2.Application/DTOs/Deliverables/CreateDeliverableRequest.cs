namespace LabCourse2.Application.DTOs.Deliverables
{
    public class CreateDeliverableRequest
    {
        public Guid MilestoneID { get; set; }
        public Guid FileID { get; set; }
    }
}
