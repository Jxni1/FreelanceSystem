using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMilestoneSubmissionNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Submission_Note",
                table: "Milestones",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Milestone_Amount",
                table: "Milestones",
                sql: "[Amount] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Milestone_Status",
                table: "Milestones",
                sql: "[status] IN ('Draft','Funded','Submitted','Approved','Cancelled')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Milestone_Status",
                table: "Milestones");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Milestone_Amount",
                table: "Milestones");

            migrationBuilder.DropColumn(
                name: "Submission_Note",
                table: "Milestones");
        }
    }
}
