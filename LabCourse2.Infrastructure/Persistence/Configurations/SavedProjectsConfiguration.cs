using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class SavedProjectsConfiguration : IEntityTypeConfiguration<SavedProjects>
    {
        public void Configure(EntityTypeBuilder<SavedProjects> builder)
        {
            //UNIQUE Constraint: Nje user mund ta ruaj nje projekt vetem nje here
            builder.HasIndex(sp => new { sp.UserID, sp.ProjectID })
                .IsUnique()
                .HasDatabaseName("UQ_User_SavedProject");

            builder.Property(sp => sp.CreatedBy)
                .IsRequired()
                .HasMaxLength(100);

        }
    }
}