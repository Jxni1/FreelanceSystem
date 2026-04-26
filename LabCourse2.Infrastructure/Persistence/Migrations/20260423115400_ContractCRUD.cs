using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ContractCRUD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PaymentID",
                table: "Deliverables",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Deliverables_PaymentID",
                table: "Deliverables",
                column: "PaymentID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables",
                column: "PaymentID",
                principalTable: "Payments",
                principalColumn: "PaymentID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables");

            migrationBuilder.DropIndex(
                name: "IX_Deliverables_PaymentID",
                table: "Deliverables");

            migrationBuilder.DropColumn(
                name: "PaymentID",
                table: "Deliverables");
        }
    }
}
