
namespace LabCourse2.Application.DTOs.Deliverables
{
    public class UpdateDeliverableRequest
    {
        // Only the file can be changed (freelancer resubmits with a new file)
        public Guid FileID { get; set; }
    }
}
