using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class newupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentID",
                table: "Deliverables",
                type: "uniqueidentifier",
                nullable: true);

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
                onDelete: ReferentialAction.Restrict);
        }
    }
}
