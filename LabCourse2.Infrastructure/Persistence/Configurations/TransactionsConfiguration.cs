using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class TransactionsConfiguration : IEntityTypeConfiguration<Transactions>
    {
        public void Configure(EntityTypeBuilder<Transactions> builder)
        {
            builder.HasKey(t => t.TransactionsID);

            builder.Property(t => t.Status).IsRequired().HasMaxLength(20);
            builder.Property(t => t.Reference).IsRequired().HasMaxLength(100);
            builder.Property(t => t.Type).IsRequired().HasMaxLength(20);
            builder.Property(t => t.Amount).IsRequired().HasPrecision(18, 2).HasDefaultValue(0m);

            builder.HasIndex(t => t.PaymentID);
            builder.HasIndex(t => t.MilestoneID);
            builder.HasIndex(t => t.Reference).IsUnique();
            builder.HasIndex(t => t.Type);

            builder.ToTable(t => t.HasCheckConstraint("CK_Transactions_Type",
                "[Type] IN ('deposit','release','refund')"));
            builder.ToTable(t => t.HasCheckConstraint("CK_Transactions_Amount", "[Amount] >= 0"));
        }
    }
}
