using System;
using System.ComponentModel.DataAnnotations;

namespace LabCourse2.Domain.Entities
{
    public class Files
    {
        [Key] 
        public Guid FilesID { get; set; }

        [Required]
        [MaxLength(100)] 
        public string Entity { get; set; } = null!;

        [Required] 
        public Guid EntityID { get; set; }

        [Required]
        [MaxLength(255)] 
        public string Filename { get; set; } = null!;

        [Required]
        [MaxLength(1000)] 
        public string File_Path { get; set; } = null!;

        [Required]
        public long File_Size { get; set; }

        [Required]
        [MaxLength(100)] 
        public string Uploaded_by { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Created_by { get; set; } = null!;
    }
}
