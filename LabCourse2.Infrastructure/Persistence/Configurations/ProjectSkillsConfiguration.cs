using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class ProjectSkillsConfiguration : IEntityTypeConfiguration<ProjectSkills>
    {
        public void Configure(EntityTypeBuilder<ProjectSkills> builder)
        {
            builder.HasIndex(ps => ps.ProjectID);
            builder.HasIndex(ps => ps.SkillID);
        }
    }
}