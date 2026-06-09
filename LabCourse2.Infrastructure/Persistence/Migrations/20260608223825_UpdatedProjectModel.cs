using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedProjectModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserRoles_UserID",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleID",
                table: "RolePermissions");

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "PermissionsID", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("a7b8c9da-ebfc-4a5b-8c9d-6e7f8a9b0c1d"), "Permission to block or suspend user accounts", "users.block" },
                    { new Guid("d4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a"), "Permission to create and post new projects", "projects.create" },
                    { new Guid("e5f6a7b8-c9da-4e5f-8a9b-4c5d6e7f8a9b"), "Permission to delete projects", "projects.delete" },
                    { new Guid("f6a7b8c9-daeb-4f5a-8b9c-5d6e7f8a9b0c"), "Permission to submit proposals for projects", "proposals.submit" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleID", "Created_At", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), "Administrator role with full system access and management capabilities", "Admin" },
                    { new Guid("b2c3d4e5-f6a7-4b5c-8d9e-1f2a3b4c5d6e"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), "Role for project owners who create projects and hire freelancers", "Client" },
                    { new Guid("c3d4e5f6-a7b8-4c5d-8e9f-2a3b4c5d6e7f"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), "Role for independent service providers who submit proposals and complete projects", "Freelancer" }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "RolePermissionsID", "Created_At", "PermissionsID", "RoleID" },
                values: new object[,]
                {
                    { new Guid("a4b5c6d7-e8f9-4a0b-1c2d-3e4f5a6b7c8d"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("a7b8c9da-ebfc-4a5b-8c9d-6e7f8a9b0c1d"), new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d") },
                    { new Guid("b5c6d7e8-f9a0-4b1c-2d3e-4f5a6b7c8d9e"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("d4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a"), new Guid("b2c3d4e5-f6a7-4b5c-8d9e-1f2a3b4c5d6e") },
                    { new Guid("c6d7e8f9-a0b1-4c2d-3e4f-5a6b7c8d9e0f"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("f6a7b8c9-daeb-4f5a-8b9c-5d6e7f8a9b0c"), new Guid("c3d4e5f6-a7b8-4c5d-8e9f-2a3b4c5d6e7f") },
                    { new Guid("d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("d4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a"), new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d") },
                    { new Guid("e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("e5f6a7b8-c9da-4e5f-8a9b-4c5d6e7f8a9b"), new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d") },
                    { new Guid("f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c"), new DateTime(2025, 4, 23, 12, 0, 0, 0, DateTimeKind.Utc), new Guid("f6a7b8c9-daeb-4f5a-8b9c-5d6e7f8a9b0c"), new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserID_RoleID",
                table: "UserRoles",
                columns: new[] { "UserID", "RoleID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleID_PermissionsID",
                table: "RolePermissions",
                columns: new[] { "RoleID", "PermissionsID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserRoles_UserID_RoleID",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleID_PermissionsID",
                table: "RolePermissions");

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("a4b5c6d7-e8f9-4a0b-1c2d-3e4f5a6b7c8d"));

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("b5c6d7e8-f9a0-4b1c-2d3e-4f5a6b7c8d9e"));

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("c6d7e8f9-a0b1-4c2d-3e4f-5a6b7c8d9e0f"));

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"));

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b"));

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumn: "RolePermissionsID",
                keyValue: new Guid("f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "PermissionsID",
                keyValue: new Guid("a7b8c9da-ebfc-4a5b-8c9d-6e7f8a9b0c1d"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "PermissionsID",
                keyValue: new Guid("d4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "PermissionsID",
                keyValue: new Guid("e5f6a7b8-c9da-4e5f-8a9b-4c5d6e7f8a9b"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "PermissionsID",
                keyValue: new Guid("f6a7b8c9-daeb-4f5a-8b9c-5d6e7f8a9b0c"));

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleID",
                keyValue: new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"));

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleID",
                keyValue: new Guid("b2c3d4e5-f6a7-4b5c-8d9e-1f2a3b4c5d6e"));

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleID",
                keyValue: new Guid("c3d4e5f6-a7b8-4c5d-8e9f-2a3b4c5d6e7f"));

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserID",
                table: "UserRoles",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleID",
                table: "RolePermissions",
                column: "RoleID");
        }
    }
}
