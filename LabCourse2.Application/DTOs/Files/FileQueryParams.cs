using System;

namespace LabCourse2.Application.DTOs.Files
{
    public class FileQueryParams
    {
        public string? Entity { get; set; }
        public Guid? EntityID { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}