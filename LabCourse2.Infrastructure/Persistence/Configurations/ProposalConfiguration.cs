using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class ProposalConfiguration : IEntityTypeConfiguration<Proposal>
    {
        public void Configure(EntityTypeBuilder<Proposal> builder)
        {
            builder.HasKey(pr => pr.ProposalId);

            builder.Property(pr => pr.DeliveryDays)
                .IsRequired();

            builder.ToTable(t => t.HasCheckConstraint("CK_Proposal_BidAmount", "[BidAmount]>0"));

            builder.ToTable(t => t.HasCheckConstraint("CK_Proposal_DeliveryDays", "[DeliveryDays]>0"));

            builder.ToTable(t => t.HasCheckConstraint("CK_Proposal_Status", "[Status] IN('pending','accepted','rejected','withdrawn')"));

            builder.Property(pr => pr.BidAmount)
                .HasPrecision(18, 2);
        }
    }
}