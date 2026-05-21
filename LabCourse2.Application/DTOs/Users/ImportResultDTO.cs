namespace LabCourse2.Application.DTOs.Users
{
    public class ImportResultDto
    {
        public int TotalRows { get; set; }
        public int ImportedRows { get; set; }
        public int FailedRows { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}