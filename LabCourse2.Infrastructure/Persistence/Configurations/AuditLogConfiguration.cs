using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Infrastructure.Persistence.Cofigurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<Audit_Logs>
    {
        public void Configure(EntityTypeBuilder<Audit_Logs> builder)
        {
            builder.HasKey(a => a.Audit_LogsID);

           
            builder.HasIndex(a => a.UserID);

            
            builder.HasIndex(a => a.Created_at);
        }
    }
}