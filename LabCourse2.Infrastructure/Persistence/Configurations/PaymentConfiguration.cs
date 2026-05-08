using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.PaymentID);

            builder.Property(p => p.Payment_method).IsRequired().HasMaxLength(50);
            builder.Property(p => p.Status).IsRequired().HasMaxLength(20);
            builder.Property(p => p.Payment_Date).IsRequired();
            builder.Property(p => p.Amount).IsRequired().HasPrecision(18, 2).HasDefaultValue(0m);

            builder.HasOne(p => p.Milestone)
                .WithMany()
                .HasForeignKey(p => p.MilestoneID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(p => p.ContractID);
            builder.HasIndex(p => p.MilestoneID);

            builder.ToTable(t => t.HasCheckConstraint("CK_Payment_Amount", "[Amount] >= 0"));
        }
    }
}
