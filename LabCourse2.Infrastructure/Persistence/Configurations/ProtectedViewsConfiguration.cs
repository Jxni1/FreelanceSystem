using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class ProtectedViewsConfiguration : IEntityTypeConfiguration<Protected_Views>
    {
        public void Configure(EntityTypeBuilder<Protected_Views> builder)
        {
            builder.HasKey(pv => pv.Protected_ViewsID);

            builder.Property(pv => pv.Viewed_at)
                .IsRequired();

            builder.Property(pv => pv.Created_by)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(pv => pv.Updated_at)
                .IsRequired();

            builder.Property(pv => pv.Updated_by)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(pv => pv.ProjectID)
                .IsRequired();

            builder.Property(pv => pv.UserID)
                .IsRequired();

            builder.HasOne(pv => pv.Project)
                .WithMany()
                .HasForeignKey(pv => pv.ProjectID);

            builder.HasOne(pv => pv.User)
                .WithMany()
                .HasForeignKey(pv => pv.UserID);

            builder.HasIndex(pv => pv.ProjectID);

         
            builder.HasIndex(pv => pv.UserID);

            builder.HasIndex(pv => pv.Viewed_at);

            builder.HasIndex(pv => new { pv.ProjectID, pv.UserID });

      

            builder.ToTable("Protected_Views");
        }
    }
}
