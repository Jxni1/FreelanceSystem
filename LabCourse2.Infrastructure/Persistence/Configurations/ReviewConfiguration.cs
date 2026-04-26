using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.HasKey(r => r.ReviewsID);

            builder.Property(r => r.Comment)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(r => r.Rating)
                .IsRequired();

            builder.Property(r => r.Created_at)
                .IsRequired();

            builder.Property(r => r.ContractID)
                .IsRequired();

            builder.Property(r => r.FreelancerID)
                .IsRequired();

            builder.Property(r => r.ClientID)
                .IsRequired();

            builder.HasOne(r => r.Contract)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.ContractID);

            builder.HasOne(r => r.Freelancer)
                .WithMany()
                .HasForeignKey(r => r.FreelancerID);

            builder.HasOne(r => r.Client)
                .WithMany()
                .HasForeignKey(r => r.ClientID);

            builder.HasIndex(r => r.FreelancerID);

            builder.HasIndex(r => r.ClientID);

       
            builder.HasIndex(r => r.ContractID);

          
            builder.HasIndex(r => r.Created_at);

         
            builder.HasIndex(r => r.ContractID)
                .IsUnique();

           

            builder.HasCheckConstraint(
                "CK_Review_Rating",
                "[Rating] >= 1 AND [Rating] <= 5"
            );

            builder.ToTable("Reviews");
        }
    }
}
