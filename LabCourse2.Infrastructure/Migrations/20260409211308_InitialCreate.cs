using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Photo = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    FilesID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Entity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Filename = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    File_Path = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    File_Size = table.Column<long>(type: "bigint", nullable: false),
                    Uploaded_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.FilesID);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionsID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    SettingID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.SettingID);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    SkillsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.SkillsID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Surname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Password_Hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Is_Active = table.Column<bool>(type: "bit", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Profile_Photo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    RolePermissionsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RoleID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.RolePermissionsID);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionsID",
                        column: x => x.PermissionsID,
                        principalTable: "Permissions",
                        principalColumn: "PermissionsID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Audit_Logs",
                columns: table => new
                {
                    Audit_LogsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Entity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    old_values = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    new_values = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IPaddress = table.Column<int>(type: "int", nullable: false),
                    Created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EntityID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audit_Logs", x => x.Audit_LogsID);
                    table.ForeignKey(
                        name: "FK_Audit_Logs_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientProfiles",
                columns: table => new
                {
                    ClientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProfiles", x => x.ClientID);
                    table.ForeignKey(
                        name: "FK_ClientProfiles_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FreelancerProfiles",
                columns: table => new
                {
                    FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Experience_Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Hourly_Rate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FreelancerProfiles", x => x.FreelancerID);
                    table.ForeignKey(
                        name: "FK_FreelancerProfiles_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    TokenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token_Hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Expires_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Revoked_At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReplacedByTokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedFromIp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.TokenID);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    ReportsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Entity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.ReportsID);
                    table.ForeignKey(
                        name: "FK_Reports_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserRolesID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Assigned_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.UserRolesID);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.ProjectID);
                    table.ForeignKey(
                        name: "FK_Projects_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_ClientProfiles_ClientID",
                        column: x => x.ClientID,
                        principalTable: "ClientProfiles",
                        principalColumn: "ClientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorite_Freelancers",
                columns: table => new
                {
                    Favorite_FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorite_Freelancers", x => x.Favorite_FreelancerID);
                    table.ForeignKey(
                        name: "FK_Favorite_Freelancers_ClientProfiles_ClientID",
                        column: x => x.ClientID,
                        principalTable: "ClientProfiles",
                        principalColumn: "ClientID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Favorite_Freelancers_FreelancerProfiles_FreelancerID",
                        column: x => x.FreelancerID,
                        principalTable: "FreelancerProfiles",
                        principalColumn: "FreelancerID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FreelancerSkills",
                columns: table => new
                {
                    FreelancerSkillsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SkillID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FreelancerSkills", x => x.FreelancerSkillsID);
                    table.ForeignKey(
                        name: "FK_FreelancerSkills_FreelancerProfiles_FreelancerID",
                        column: x => x.FreelancerID,
                        principalTable: "FreelancerProfiles",
                        principalColumn: "FreelancerID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FreelancerSkills_Skills_SkillID",
                        column: x => x.SkillID,
                        principalTable: "Skills",
                        principalColumn: "SkillsID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Contracts",
                columns: table => new
                {
                    ContractID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Start_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    End_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Agreed_Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contracts", x => x.ContractID);
                    table.ForeignKey(
                        name: "FK_Contracts_ClientProfiles_ClientID",
                        column: x => x.ClientID,
                        principalTable: "ClientProfiles",
                        principalColumn: "ClientID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contracts_FreelancerProfiles_FreelancerID",
                        column: x => x.FreelancerID,
                        principalTable: "FreelancerProfiles",
                        principalColumn: "FreelancerID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contracts_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateTable(
                name: "ProjectSkills",
                columns: table => new
                {
                    ProjectSkillsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SkillID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectSkills", x => x.ProjectSkillsID);
                    table.ForeignKey(
                        name: "FK_ProjectSkills_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectSkills_Skills_SkillID",
                        column: x => x.SkillID,
                        principalTable: "Skills",
                        principalColumn: "SkillsID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Proposals",
                columns: table => new
                {
                    ProposalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeliveryDays = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FreelancerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proposals", x => x.ProposalId);
                    table.ForeignKey(
                        name: "FK_Proposals_FreelancerProfiles_FreelancerId",
                        column: x => x.FreelancerId,
                        principalTable: "FreelancerProfiles",
                        principalColumn: "FreelancerID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Proposals_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Protected_Views",
                columns: table => new
                {
                    Protected_ViewsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Viewed_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Protected_Views", x => x.Protected_ViewsID);
                    table.ForeignKey(
                        name: "FK_Protected_Views_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Protected_Views_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SavedProjects",
                columns: table => new
                {
                    SavedProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedProjects", x => x.SavedProjectID);
                    table.ForeignKey(
                        name: "FK_SavedProjects_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SavedProjects_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Milestones",
                columns: table => new
                {
                    MilestoneID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContractID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Milestones", x => x.MilestoneID);
                    table.ForeignKey(
                        name: "FK_Milestones_Contracts_ContractID",
                        column: x => x.ContractID,
                        principalTable: "Contracts",
                        principalColumn: "ContractID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Payment_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_Payments_Contracts_ContractID",
                        column: x => x.ContractID,
                        principalTable: "Contracts",
                        principalColumn: "ContractID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    ReviewsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FreelancerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.ReviewsID);
                    table.ForeignKey(
                        name: "FK_Reviews_ClientProfiles_ClientID",
                        column: x => x.ClientID,
                        principalTable: "ClientProfiles",
                        principalColumn: "ClientID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Contracts_ContractID",
                        column: x => x.ContractID,
                        principalTable: "Contracts",
                        principalColumn: "ContractID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_FreelancerProfiles_FreelancerID",
                        column: x => x.FreelancerID,
                        principalTable: "FreelancerProfiles",
                        principalColumn: "FreelancerID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Deliverables",
                columns: table => new
                {
                    DeliverablesID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Submitted_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Approved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MilestoneID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliverables", x => x.DeliverablesID);
                    table.ForeignKey(
                        name: "FK_Deliverables_Files_FileID",
                        column: x => x.FileID,
                        principalTable: "Files",
                        principalColumn: "FilesID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deliverables_Milestones_MilestoneID",
                        column: x => x.MilestoneID,
                        principalTable: "Milestones",
                        principalColumn: "MilestoneID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    TransactionsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PaymentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MilestoneID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.TransactionsID);
                    table.ForeignKey(
                        name: "FK_Transactions_Milestones_MilestoneID",
                        column: x => x.MilestoneID,
                        principalTable: "Milestones",
                        principalColumn: "MilestoneID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Payments_PaymentID",
                        column: x => x.PaymentID,
                        principalTable: "Payments",
                        principalColumn: "PaymentID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Audit_Logs_UserID",
                table: "Audit_Logs",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_UserID",
                table: "ClientProfiles",
                column: "UserID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ClientID",
                table: "Contracts",
                column: "ClientID");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_FreelancerID",
                table: "Contracts",
                column: "FreelancerID");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ProjectID",
                table: "Contracts",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliverables_FileID",
                table: "Deliverables",
                column: "FileID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliverables_MilestoneID",
                table: "Deliverables",
                column: "MilestoneID");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_Freelancers_ClientID",
                table: "Favorite_Freelancers",
                column: "ClientID");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_Freelancers_FreelancerID",
                table: "Favorite_Freelancers",
                column: "FreelancerID");

            migrationBuilder.CreateIndex(
                name: "IX_FreelancerProfiles_UserID",
                table: "FreelancerProfiles",
                column: "UserID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FreelancerSkills_FreelancerID",
                table: "FreelancerSkills",
                column: "FreelancerID");

            migrationBuilder.CreateIndex(
                name: "IX_FreelancerSkills_SkillID",
                table: "FreelancerSkills",
                column: "SkillID");

            migrationBuilder.CreateIndex(
                name: "IX_Milestones_ContractID",
                table: "Milestones",
                column: "ContractID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ContractID",
                table: "Payments",
                column: "ContractID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategoryMaps_CategoryID",
                table: "ProjectCategoryMaps",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategoryMaps_ProjectID",
                table: "ProjectCategoryMaps",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CategoryID",
                table: "Projects",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ClientID",
                table: "Projects",
                column: "ClientID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectSkills_ProjectID",
                table: "ProjectSkills",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectSkills_SkillID",
                table: "ProjectSkills",
                column: "SkillID");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_FreelancerId",
                table: "Proposals",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_ProjectId",
                table: "Proposals",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Protected_Views_ProjectID",
                table: "Protected_Views",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Protected_Views_UserID",
                table: "Protected_Views",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserID",
                table: "RefreshTokens",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_UserID",
                table: "Reports",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ClientID",
                table: "Reviews",
                column: "ClientID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ContractID",
                table: "Reviews",
                column: "ContractID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_FreelancerID",
                table: "Reviews",
                column: "FreelancerID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionsID",
                table: "RolePermissions",
                column: "PermissionsID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleID",
                table: "RolePermissions",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_SavedProjects_ProjectID",
                table: "SavedProjects",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_SavedProjects_UserID",
                table: "SavedProjects",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_MilestoneID",
                table: "Transactions",
                column: "MilestoneID");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PaymentID",
                table: "Transactions",
                column: "PaymentID");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_Reference",
                table: "Transactions",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleID",
                table: "UserRoles",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserID",
                table: "UserRoles",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Audit_Logs");

            migrationBuilder.DropTable(
                name: "Deliverables");

            migrationBuilder.DropTable(
                name: "Favorite_Freelancers");

            migrationBuilder.DropTable(
                name: "FreelancerSkills");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProjectCategoryMaps");

            migrationBuilder.DropTable(
                name: "ProjectSkills");

            migrationBuilder.DropTable(
                name: "Proposals");

            migrationBuilder.DropTable(
                name: "Protected_Views");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SavedProjects");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Milestones");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Contracts");

            migrationBuilder.DropTable(
                name: "FreelancerProfiles");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "ClientProfiles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
