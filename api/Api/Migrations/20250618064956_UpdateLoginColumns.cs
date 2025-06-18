using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLoginColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "encrypted_identifier",
                table: "logins");

            migrationBuilder.DropColumn(
                name: "encrypted_name",
                table: "logins");

            migrationBuilder.DropColumn(
                name: "encrypted_notes",
                table: "logins");

            migrationBuilder.DropColumn(
                name: "encrypted_password",
                table: "logins");

            migrationBuilder.RenameColumn(
                name: "encrypted_url",
                table: "logins",
                newName: "encrypted_data");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "encrypted_data",
                table: "logins",
                newName: "encrypted_url");

            migrationBuilder.AddColumn<byte[]>(
                name: "encrypted_identifier",
                table: "logins",
                type: "Blob",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "encrypted_name",
                table: "logins",
                type: "Blob",
                nullable: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "encrypted_notes",
                table: "logins",
                type: "Blob",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "encrypted_password",
                table: "logins",
                type: "Blob",
                nullable: true);
        }
    }
}
