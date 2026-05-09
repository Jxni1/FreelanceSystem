using LabCourse2.Application.DTOs.Files;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class FileMappingExtensions
    {
        public static FileResponse ToResponse(this Files file) =>
            new()
            {
                FilesID = file.FilesID,
                Entity = file.Entity,
                EntityID = file.EntityID,
                Filename = file.Filename,
                File_Path = file.File_Path,
                File_Size = file.File_Size,
                Uploaded_by = file.Uploaded_by,
                Created_at = file.Created_at
            };
    }
}