using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMilestoneStatusCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Milestone_Status')
    ALTER TABLE [Milestones] DROP CONSTRAINT [CK_Milestone_Status];
ALTER TABLE [Milestones] ADD CONSTRAINT [CK_Milestone_Status]
    CHECK ([status] IN ('Draft','PendingPayment','Funded','Submitted','Approved','Cancelled'));
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Milestone_Status')
    ALTER TABLE [Milestones] DROP CONSTRAINT [CK_Milestone_Status];
ALTER TABLE [Milestones] ADD CONSTRAINT [CK_Milestone_Status]
    CHECK ([status] IN ('Draft','Funded','Submitted','Approved','Cancelled'));
");
        }
    }
}
