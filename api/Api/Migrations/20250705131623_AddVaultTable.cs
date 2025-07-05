using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVaultTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_logins_users_user_id",
                table: "logins");

            migrationBuilder.DropIndex(
                name: "ix_logins_user_id",
                table: "logins");

            migrationBuilder.AddColumn<Guid>(
                name: "vault_id",
                table: "logins",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "vaults",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    name = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vaults", x => x.id);
                    table.ForeignKey(
                        name: "fk_vaults_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_logins_vault_id",
                table: "logins",
                column: "vault_id");

            migrationBuilder.CreateIndex(
                name: "ix_vaults_user_id",
                table: "vaults",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins",
                column: "vault_id",
                principalTable: "vaults",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins");

            migrationBuilder.DropTable(
                name: "vaults");

            migrationBuilder.DropIndex(
                name: "ix_logins_vault_id",
                table: "logins");

            migrationBuilder.DropColumn(
                name: "vault_id",
                table: "logins");

            migrationBuilder.CreateIndex(
                name: "ix_logins_user_id",
                table: "logins",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_logins_users_user_id",
                table: "logins",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
