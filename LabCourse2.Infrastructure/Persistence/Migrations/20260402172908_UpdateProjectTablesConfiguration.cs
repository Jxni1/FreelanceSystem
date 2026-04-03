using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProjectTablesConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views");

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views");

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
