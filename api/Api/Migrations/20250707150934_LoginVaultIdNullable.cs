using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class LoginVaultIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins");

            migrationBuilder.DeleteData(
                table: "vaults",
                keyColumn: "id",
                keyValue: new Guid("f7a4597a-0293-4ef1-af45-bd9882055a35"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f"));

            migrationBuilder.AlterColumn<Guid>(
                name: "vault_id",
                table: "logins",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3"), new DateTime(2025, 7, 7, 15, 9, 33, 662, DateTimeKind.Utc).AddTicks(7010), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 133, 201, 169, 91, 198, 103, 161, 95, 175, 127, 41, 182, 62, 48, 152, 92 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("c5aaa345-047c-4f95-8073-44ed63906c50"), new DateTime(2025, 7, 7, 15, 9, 33, 780, DateTimeKind.Utc).AddTicks(1720), "Default Vault", null, new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3") });

            migrationBuilder.AddForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins",
                column: "vault_id",
                principalTable: "vaults",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins");

            migrationBuilder.DeleteData(
                table: "vaults",
                keyColumn: "id",
                keyValue: new Guid("c5aaa345-047c-4f95-8073-44ed63906c50"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3"));

            migrationBuilder.AlterColumn<Guid>(
                name: "vault_id",
                table: "logins",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f"), new DateTime(2025, 7, 6, 8, 53, 54, 894, DateTimeKind.Utc).AddTicks(4470), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 139, 113, 56, 188, 210, 170, 85, 70, 179, 174, 181, 11, 101, 122, 86, 16 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("f7a4597a-0293-4ef1-af45-bd9882055a35"), new DateTime(2025, 7, 6, 8, 53, 55, 11, DateTimeKind.Utc).AddTicks(8550), "Default Vault", null, new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f") });

            migrationBuilder.AddForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins",
                column: "vault_id",
                principalTable: "vaults",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
