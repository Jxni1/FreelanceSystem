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

            
            builder.HasIndex(p => p.ContractID);

            builder.Property(p => p.Payment_method).IsRequired().HasMaxLength(50);
            builder.Property(p => p.Status).IsRequired().HasMaxLength(20);
            builder.Property(p => p.Payment_Date).IsRequired();
        }
    }
}
