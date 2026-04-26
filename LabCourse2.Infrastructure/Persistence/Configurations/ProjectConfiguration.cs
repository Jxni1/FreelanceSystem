using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class ProjectConfiguration : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            builder.HasKey(p => p.ProjectID);

            builder.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(p => p.Description)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(p => p.Budget)
                .HasPrecision(18, 2);

            builder.Property(p => p.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(p => p.Visibility)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.UpdatedAt).IsRequired();

            builder.ToTable("Projects", t =>
            {
                t.HasCheckConstraint("CK_Project_Budget",
                    "[Budget] >= 0");

                t.HasCheckConstraint("CK_Project_Status",
                    $"[Status] IN ('{ProjectStatus.Open}', '{ProjectStatus.InProgress}', " +
                    $"'{ProjectStatus.Completed}', '{ProjectStatus.Cancelled}')");

                t.HasCheckConstraint("CK_Project_Visibility",
                    $"[Visibility] IN ('{ProjectVisibility.Public}', '{ProjectVisibility.Private}')");
            });

            builder.HasIndex(p => p.ClientID);
            builder.HasIndex(p => p.CategoryID);
            builder.HasIndex(p => p.Status);
            builder.HasIndex(p => p.Budget);
            builder.HasIndex(p => p.CreatedAt);

            builder.HasOne(p => p.Client)
                .WithMany()
                .HasForeignKey(p => p.ClientID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}