using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class newcrud : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Contracts_ContractID1",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ContractID1",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ContractID1",
                table: "Payments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractID1",
                table: "Payments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ContractID1",
                table: "Payments",
                column: "ContractID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Contracts_ContractID1",
                table: "Payments",
                column: "ContractID1",
                principalTable: "Contracts",
                principalColumn: "ContractID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
