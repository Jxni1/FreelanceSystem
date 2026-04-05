using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class ProjectCategoryMapConfiguration : IEntityTypeConfiguration<ProjectCategoryMap>
    {
        public void Configure(EntityTypeBuilder<ProjectCategoryMap> builder)
        {
            // per me kon UNIQUE ProjectID dhe CategoryID
            builder.HasKey(pcm => new { pcm.ProjectID, pcm.CategoryID });

            builder.HasIndex(pcm => pcm.ProjectID);
            builder.HasIndex(pcm => pcm.CategoryID);
        }
    }

}