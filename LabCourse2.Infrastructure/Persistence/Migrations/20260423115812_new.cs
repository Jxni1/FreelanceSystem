using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class @new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables",
                column: "PaymentID",
                principalTable: "Payments",
                principalColumn: "PaymentID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Payments_PaymentID",
                table: "Deliverables",
                column: "PaymentID",
                principalTable: "Payments",
                principalColumn: "PaymentID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
