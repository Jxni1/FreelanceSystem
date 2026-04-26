using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class SettingsConfiguration : IEntityTypeConfiguration<Setting>
    {
        public void Configure(EntityTypeBuilder<Setting> builder)
        {
            builder.HasKey(s => s.SettingID);

           
            builder.HasIndex(s => s.Key)
                .IsUnique();

            builder.Property(s => s.Key)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Value)
                .IsRequired();
        }
    }
}