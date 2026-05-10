namespace LabCourse2.Application.DTOs.Reviews
{
    public class UpdateReviewRequest
    {
        public string Comment { get; init; } = string.Empty;
        public int Rating { get; init; }
    }
}