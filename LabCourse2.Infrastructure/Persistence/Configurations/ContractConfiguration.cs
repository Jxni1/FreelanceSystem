using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class ContractConfiguration : IEntityTypeConfiguration<Contract>
    {
        public void Configure(EntityTypeBuilder<Contract> builder)
        {
            builder.HasKey(c => c.ContractID);

            builder.Property(c => c.Description)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(c => c.Start_Date)
                .IsRequired();

            builder.Property(c => c.End_Date)
                .IsRequired();

            builder.Property(c => c.Agreed_Price)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(c => c.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(c => c.ClientID)
                .IsRequired();

            builder.Property(c => c.FreelancerID)
                .IsRequired();

            builder.Property(c => c.ProjectID)
                .IsRequired();

            builder.HasOne(c => c.Proposal)
                .WithMany()
                .HasForeignKey(c => c.ProposalID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Client)
                .WithMany()
                .HasForeignKey(c => c.ClientID);

            builder.HasOne(c => c.Freelancer)
                .WithMany()
                .HasForeignKey(c => c.FreelancerID);

            builder.HasOne(c => c.Project)
                .WithMany()
                .HasForeignKey(c => c.ProjectID);

            builder.HasIndex(c => c.ProposalID);
            builder.HasIndex(c => c.ClientID);
            builder.HasIndex(c => c.FreelancerID);
            builder.HasIndex(c => c.ProjectID);
            builder.HasIndex(c => c.Status);
            builder.HasIndex(c => c.Start_Date);
            builder.HasIndex(c => c.End_Date);
            builder.HasIndex(c => new { c.ClientID, c.Status });
            builder.HasIndex(c => new { c.FreelancerID, c.Status });

            builder.ToTable(t => t.HasCheckConstraint("CK_Contract_AgreedPrice", "[Agreed_Price] >= 0"));
            builder.ToTable(t => t.HasCheckConstraint("CK_Contract_Date", "[End_Date] >= [Start_Date]"));
        }
    }
}
