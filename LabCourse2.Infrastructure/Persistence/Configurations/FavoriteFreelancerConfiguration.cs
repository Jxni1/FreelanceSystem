using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Configurations
{
    public class FavoriteFreelancerConfiguration : IEntityTypeConfiguration<Favorite_Freelancer>
    {
        public void Configure(EntityTypeBuilder<Favorite_Freelancer> builder)
        {
            builder.HasKey(f => f.Favorite_FreelancerID);

            builder.Property(f => f.ClientID)
                .IsRequired();

            builder.Property(f => f.FreelancerID)
                .IsRequired();

            builder.HasOne(f => f.Client)
                .WithMany()
                .HasForeignKey(f => f.ClientID);

            builder.HasOne(f => f.Freelancer)
                .WithMany()
                .HasForeignKey(f => f.FreelancerID);

            
            builder.HasIndex(f => f.ClientID);

            builder.HasIndex(f => f.FreelancerID);

            // Prevent duplicate favorites 
            builder.HasIndex(f => new { f.ClientID, f.FreelancerID })
                .IsUnique();

            builder.ToTable("Favorite_Freelancers");
        }
    }
}
