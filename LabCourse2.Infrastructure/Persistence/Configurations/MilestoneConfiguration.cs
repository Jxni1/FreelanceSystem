using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class MilestoneConfiguration : IEntityTypeConfiguration<Milestone>
    {
        public void Configure(EntityTypeBuilder<Milestone> builder)
        {
            builder.HasKey(m => m.MilestoneID);

            builder.Property(m => m.Title)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(m => m.Description)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(m => m.DueDate)
                .IsRequired();

            builder.Property(m => m.status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(m => m.Order_Index)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(m => m.Funded_at);

            builder.Property(m => m.Submitted_at);

            builder.Property(m => m.Approved_at);

            builder.Property(m => m.Submission_Note)
                .HasMaxLength(2000);

            builder.Property(m => m.ContractID)
                .IsRequired();

            builder.HasOne(m => m.Contract)
                .WithMany(c => c.Milestones)
                .HasForeignKey(m => m.ContractID);

            builder.HasIndex(m => m.ContractID);
            builder.HasIndex(m => m.status);
            builder.HasIndex(m => m.DueDate);
            builder.HasIndex(m => m.Order_Index);
            builder.HasIndex(m => new { m.ContractID, m.Order_Index }).IsUnique();
            builder.HasIndex(m => new { m.ContractID, m.DueDate });

            builder.ToTable("Milestones");
        }
    }
}
