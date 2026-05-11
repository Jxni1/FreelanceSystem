using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LabCourse2.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FavoriteFreelancers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Favorite_Freelancers_ClientID",
                table: "Favorite_Freelancers");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_Freelancers_ClientID_FreelancerID",
                table: "Favorite_Freelancers",
                columns: new[] { "ClientID", "FreelancerID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Favorite_Freelancers_ClientID_FreelancerID",
                table: "Favorite_Freelancers");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_Freelancers_ClientID",
                table: "Favorite_Freelancers",
                column: "ClientID");
        }
    }
}
