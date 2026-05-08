namespace LabCourse2.Application.DTOs.Files
{
    public class FileResponse
    {
        public Guid FilesID { get; set; }
        public string Entity { get; set; } = string.Empty;
        public Guid EntityID { get; set; }
        public string Filename { get; set; } = string.Empty;
        public string File_Path { get; set; } = string.Empty;
        public long File_Size { get; set; }
        public string Uploaded_by { get; set; } = string.Empty;
        public DateTime Created_at { get; set; }
    }
}