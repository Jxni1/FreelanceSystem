using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class DeliverablesConfiguration : IEntityTypeConfiguration<Deliverables>
    {
        public void Configure(EntityTypeBuilder<Deliverables> builder)
        {
            builder.HasKey(d => d.DeliverablesID);

            builder.Property(d => d.Submitted_at)
                .IsRequired();

            builder.Property(d => d.Approved_at);

            builder.Property(d => d.MilestoneID)
                .IsRequired();

            builder.Property(d => d.FileID)
                .IsRequired();

            builder.HasOne(d => d.Milestone)
                .WithMany()
                .HasForeignKey(d => d.MilestoneID);

            builder.HasOne(d => d.File)
                .WithMany()
                .HasForeignKey(d => d.FileID);

    
            builder.HasIndex(d => d.MilestoneID);

          
            builder.HasIndex(d => d.FileID);

           
            builder.HasIndex(d => d.Submitted_at);

            
            builder.HasIndex(d => d.Approved_at);

          
            builder.HasCheckConstraint(
                "CK_Deliverables_ApprovalDate",
                "[Approved_at] IS NULL OR [Approved_at] >= [Submitted_at]"
            );

            builder.ToTable("Deliverables");
        }
    }
}
