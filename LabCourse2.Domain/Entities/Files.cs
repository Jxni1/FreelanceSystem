using System;
namespace LabCourse2.Domain.Entities
{
    public class Files
    {
        public Guid FilesID { get; set; }
        public string Entity { get; set; } = null!;
        public Guid EntityID { get; set; }
        public string Filename { get; set; } = null!;
        public string File_Path { get; set; } = null!;
        public long File_Size { get; set; }
        public string Uploaded_by { get; set; } = null!;
        public string Created_by { get; set; } = null!;
    }
}
