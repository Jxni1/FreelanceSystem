using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncRemainingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_FreelancerProfiles_FreelancerID",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Projects_ProjectID",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Files_FileID",
                table: "Deliverables");

            migrationBuilder.DropForeignKey(
                name: "FK_Favorite_Freelancers_FreelancerProfiles_FreelancerID",
                table: "Favorite_Freelancers");

            migrationBuilder.DropForeignKey(
                name: "FK_FreelancerSkills_Skills_SkillID",
                table: "FreelancerSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Contracts_ContractID",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Categories_CategoryID",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Proposals_Projects_ProjectId",
                table: "Proposals");

            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views");

            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Users_UserID",
                table: "Protected_Views");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ClientProfiles_ClientID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_FreelancerProfiles_FreelancerID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedProjects_Projects_ProjectID",
                table: "SavedProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Milestones_MilestoneID",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Payments_PaymentID",
                table: "Transactions");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_FreelancerProfiles_FreelancerID",
                table: "Contracts",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Projects_ProjectID",
                table: "Contracts",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Files_FileID",
                table: "Deliverables",
                column: "FileID",
                principalTable: "Files",
                principalColumn: "FilesID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Favorite_Freelancers_FreelancerProfiles_FreelancerID",
                table: "Favorite_Freelancers",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FreelancerSkills_Skills_SkillID",
                table: "FreelancerSkills",
                column: "SkillID",
                principalTable: "Skills",
                principalColumn: "SkillsID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Contracts_ContractID",
                table: "Payments",
                column: "ContractID",
                principalTable: "Contracts",
                principalColumn: "ContractID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Categories_CategoryID",
                table: "Projects",
                column: "CategoryID",
                principalTable: "Categories",
                principalColumn: "CategoryID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Proposals_Projects_ProjectId",
                table: "Proposals",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Users_UserID",
                table: "Protected_Views",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ClientProfiles_ClientID",
                table: "Reviews",
                column: "ClientID",
                principalTable: "ClientProfiles",
                principalColumn: "ClientID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_FreelancerProfiles_FreelancerID",
                table: "Reviews",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SavedProjects_Projects_ProjectID",
                table: "SavedProjects",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Milestones_MilestoneID",
                table: "Transactions",
                column: "MilestoneID",
                principalTable: "Milestones",
                principalColumn: "MilestoneID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Payments_PaymentID",
                table: "Transactions",
                column: "PaymentID",
                principalTable: "Payments",
                principalColumn: "PaymentID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_FreelancerProfiles_FreelancerID",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Projects_ProjectID",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Files_FileID",
                table: "Deliverables");

            migrationBuilder.DropForeignKey(
                name: "FK_Favorite_Freelancers_FreelancerProfiles_FreelancerID",
                table: "Favorite_Freelancers");

            migrationBuilder.DropForeignKey(
                name: "FK_FreelancerSkills_Skills_SkillID",
                table: "FreelancerSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Contracts_ContractID",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Categories_CategoryID",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Proposals_Projects_ProjectId",
                table: "Proposals");

            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views");

            migrationBuilder.DropForeignKey(
                name: "FK_Protected_Views_Users_UserID",
                table: "Protected_Views");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ClientProfiles_ClientID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_FreelancerProfiles_FreelancerID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedProjects_Projects_ProjectID",
                table: "SavedProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Milestones_MilestoneID",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Payments_PaymentID",
                table: "Transactions");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_FreelancerProfiles_FreelancerID",
                table: "Contracts",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Projects_ProjectID",
                table: "Contracts",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Files_FileID",
                table: "Deliverables",
                column: "FileID",
                principalTable: "Files",
                principalColumn: "FilesID");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorite_Freelancers_FreelancerProfiles_FreelancerID",
                table: "Favorite_Freelancers",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID");

            migrationBuilder.AddForeignKey(
                name: "FK_FreelancerSkills_Skills_SkillID",
                table: "FreelancerSkills",
                column: "SkillID",
                principalTable: "Skills",
                principalColumn: "SkillsID");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Contracts_ContractID",
                table: "Payments",
                column: "ContractID",
                principalTable: "Contracts",
                principalColumn: "ContractID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Categories_CategoryID",
                table: "Projects",
                column: "CategoryID",
                principalTable: "Categories",
                principalColumn: "CategoryID");

            migrationBuilder.AddForeignKey(
                name: "FK_Proposals_Projects_ProjectId",
                table: "Proposals",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Projects_ProjectID",
                table: "Protected_Views",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Protected_Views_Users_UserID",
                table: "Protected_Views",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ClientProfiles_ClientID",
                table: "Reviews",
                column: "ClientID",
                principalTable: "ClientProfiles",
                principalColumn: "ClientID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_FreelancerProfiles_FreelancerID",
                table: "Reviews",
                column: "FreelancerID",
                principalTable: "FreelancerProfiles",
                principalColumn: "FreelancerID");

            migrationBuilder.AddForeignKey(
                name: "FK_SavedProjects_Projects_ProjectID",
                table: "SavedProjects",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Milestones_MilestoneID",
                table: "Transactions",
                column: "MilestoneID",
                principalTable: "Milestones",
                principalColumn: "MilestoneID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Payments_PaymentID",
                table: "Transactions",
                column: "PaymentID",
                principalTable: "Payments",
                principalColumn: "PaymentID");
        }
    }
}
