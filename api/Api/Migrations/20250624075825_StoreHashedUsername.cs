using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class StoreHashedUsername : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "username",
                table: "users",
                newName: "username_hash");

            migrationBuilder.RenameIndex(
                name: "ix_users_username",
                table: "users",
                newName: "ix_users_username_hash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "username_hash",
                table: "users",
                newName: "username");

            migrationBuilder.RenameIndex(
                name: "ix_users_username_hash",
                table: "users",
                newName: "ix_users_username");
        }
    }
}
