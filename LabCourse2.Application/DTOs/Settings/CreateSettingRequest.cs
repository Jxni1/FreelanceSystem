namespace LabCourse2.Application.DTOs.Settings
{
    public class CreateSettingRequest
    {
        public string Key { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? Description { get; set; }
    }
}