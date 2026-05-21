using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Deleted_At",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Is_Deleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Deleted_At",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Is_Deleted",
                table: "Users");
        }
    }
}
