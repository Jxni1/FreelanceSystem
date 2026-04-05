using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class FreelancerSkillConfiguration : IEntityTypeConfiguration<FreelancerSkills>
    {
        public void Configure(EntityTypeBuilder<FreelancerSkills> builder)
        {
            builder.ToTable(t => t.HasCheckConstraint("CK_FreelancerSkill_Level", "[Level]>=1 AND [Level]<=5"));

            builder.HasIndex(fs => fs.FreelancerID);
            builder.HasIndex(fs => fs.SkillID);

            // konfigurimi i vetise Level per te siguruar qe vlera eshte midis 1 dhe 5
            builder.Property(fs => fs.Level)
                .IsRequired();

        }
    }
}