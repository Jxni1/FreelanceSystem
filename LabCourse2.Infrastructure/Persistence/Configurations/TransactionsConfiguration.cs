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

           
            builder.HasIndex(t => t.PaymentID);
            builder.HasIndex(t => t.MilestoneID);

            
            builder.HasIndex(t => t.Reference).IsUnique();

            builder.Property(t => t.Status).IsRequired().HasMaxLength(20);
            builder.Property(t => t.Reference).IsRequired().HasMaxLength(100);
        }
    }
}
