namespace LabCourse2.Application.DTOs.Reviews
{
    public class CreateReviewRequest
    {
        public Guid ContractID { get; init; }
        public string Comment { get; init; } = string.Empty;
        public int Rating { get; init; }
    }
}
