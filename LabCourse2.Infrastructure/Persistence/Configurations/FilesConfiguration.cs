using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class FilesConfiguration : IEntityTypeConfiguration<Files>
    {
        public void Configure(EntityTypeBuilder<Files> builder)
        {
            builder.HasKey(f => f.FilesID);

            builder.Property(f => f.Entity)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(f => f.EntityID)
                .IsRequired();

            builder.Property(f => f.Filename)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(f => f.File_Path)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(f => f.File_Size)
                .IsRequired();

            builder.Property(f => f.Uploaded_by)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(f => f.Created_at)
                .IsRequired();

            builder.HasIndex(f => new { f.Entity, f.EntityID });

            builder.HasIndex(f => f.Filename);

            builder.HasIndex(f => f.Uploaded_by);

            builder.HasCheckConstraint(
                "CK_Files_FileSize",
                "[File_Size] > 0"
            );

            builder.ToTable("Files");
        }
    }
}