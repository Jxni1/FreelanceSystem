using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class ReportConfiguration : IEntityTypeConfiguration<Report>
    {
        public void Configure(EntityTypeBuilder<Report> builder)
        {
            builder.HasKey(r => r.ReportsID);

            builder.Property(r => r.Entity)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(r => r.Reason)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(r => r.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(r => r.Created_at)
                .IsRequired();

            builder.Property(r => r.Created_by)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(r => r.Updated_at)
                .IsRequired();

            builder.Property(r => r.Updated_by)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(r => r.UserID)
                .IsRequired();

            builder.Property(r => r.EntityID)
                .IsRequired();

            builder.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserID);

        
            builder.HasIndex(r => r.UserID);

           
            builder.HasIndex(r => r.Status);

          
            builder.HasIndex(r => r.Entity);

           
            builder.HasIndex(r => new { r.Entity, r.EntityID });

           
            builder.HasIndex(r => r.Created_at);

           

            builder.HasCheckConstraint(
                "CK_Report_Status",
                "[Status] IN ('pending','reviewed','resolved','rejected')"
            );

            builder.ToTable("Reports");
        }
    }
}
