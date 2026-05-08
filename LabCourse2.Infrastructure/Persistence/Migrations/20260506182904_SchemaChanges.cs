using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SchemaChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectCategoryMaps");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Contracts");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "Transactions",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "Created_at",
                table: "Proposals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "Payments",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "MilestoneID",
                table: "Payments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Approved_at",
                table: "Milestones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Funded_at",
                table: "Milestones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Order_Index",
                table: "Milestones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Submitted_at",
                table: "Milestones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProposalID",
                table: "Contracts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Transactions_Type",
                table: "Transactions",
                sql: "[Type] IN ('deposit','release','refund')");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_MilestoneID",
                table: "Payments",
                column: "MilestoneID");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ProposalID",
                table: "Contracts",
                column: "ProposalID");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Proposals_ProposalID",
                table: "Contracts",
                column: "ProposalID",
                principalTable: "Proposals",
                principalColumn: "ProposalId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Milestones_MilestoneID",
                table: "Payments",
                column: "MilestoneID",
                principalTable: "Milestones",
                principalColumn: "MilestoneID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Proposals_ProposalID",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Milestones_MilestoneID",
                table: "Payments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Transactions_Type",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Payments_MilestoneID",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ProposalID",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Created_at",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "MilestoneID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "Approved_at",
                table: "Milestones");

            migrationBuilder.DropColumn(
                name: "Funded_at",
                table: "Milestones");

            migrationBuilder.DropColumn(
                name: "Order_Index",
                table: "Milestones");

            migrationBuilder.DropColumn(
                name: "Submitted_at",
                table: "Milestones");

            migrationBuilder.DropColumn(
                name: "ProposalID",
                table: "Contracts");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Contracts",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ProjectCategoryMaps",
                columns: table => new
                {
                    ProjectCategoryMapID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCategoryMaps", x => x.ProjectCategoryMapID);
                    table.ForeignKey(
                        name: "FK_ProjectCategoryMaps_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectCategoryMaps_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategoryMaps_CategoryID",
                table: "ProjectCategoryMaps",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategoryMaps_ProjectID",
                table: "ProjectCategoryMaps",
                column: "ProjectID");
        }
    }
}
