namespace LabCourse2.Application.DTOs.Settings
{
    public class UpdateSettingRequest
    {
        public string Value { get; set; } = null!;
        public string? Description { get; set; }
    }
}