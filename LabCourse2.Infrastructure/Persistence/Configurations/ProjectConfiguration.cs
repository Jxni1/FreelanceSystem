using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class ProjectConfiguration : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            builder.HasKey(p => p.ProjectID);

            builder.Property(p => p.Budget)
                .HasPrecision(18, 2);

            builder.ToTable(t => t.HasCheckConstraint("CK_Project_Budget", "[Budget]>=0"));

            builder.ToTable(t => t.HasCheckConstraint("CK_Project_Status", "[Status] IN('open','in_progress','completed','cancelled')"));

            builder.ToTable(t => t.HasCheckConstraint("CK_Project_Visibility", "[Visibility] IN('public','private')"));

            builder.HasIndex(p => p.ClientID);
            builder.HasIndex(p => p.Status);
            builder.HasIndex(p => p.Budget);
            builder.HasIndex(p => p.CreatedAt);
        }
    }
}