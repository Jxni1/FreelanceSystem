using Microsoft.AspNetCore.Http;
using System;

namespace LabCourse2.Application.DTOs.Files
{
    public class UploadFileRequest
    {
        public string Entity { get; set; } = string.Empty;
        public Guid EntityID { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}