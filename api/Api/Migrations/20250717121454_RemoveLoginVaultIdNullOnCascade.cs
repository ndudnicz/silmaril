using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLoginVaultIdNullOnCascade : Migration
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
                keyValue: new Guid("044ecf10-f1eb-4594-a2a7-cd4d5ba56355"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("bffe53c5-f989-d5b7-9a55-0dca3d4d9df9"));

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("c9251dda-9115-4ef8-aac7-ad655dc65b0f"), new DateTime(2025, 7, 17, 12, 14, 54, 390, DateTimeKind.Utc).AddTicks(7810), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 50, 148, 214, 247, 81, 154, 55, 144, 236, 44, 93, 117, 212, 241, 130, 221 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("45647e6f-65ce-4b49-8d17-d0ebc0e2ff6c"), new DateTime(2025, 7, 17, 12, 14, 54, 511, DateTimeKind.Utc).AddTicks(4750), "Default Vault", null, new Guid("c9251dda-9115-4ef8-aac7-ad655dc65b0f") });

            migrationBuilder.AddForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins",
                column: "vault_id",
                principalTable: "vaults",
                principalColumn: "id");
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
                keyValue: new Guid("45647e6f-65ce-4b49-8d17-d0ebc0e2ff6c"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("c9251dda-9115-4ef8-aac7-ad655dc65b0f"));

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("bffe53c5-f989-d5b7-9a55-0dca3d4d9df9"), new DateTime(2025, 7, 7, 15, 27, 43, 675, DateTimeKind.Utc).AddTicks(8010), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 249, 219, 140, 250, 128, 4, 70, 207, 35, 211, 96, 44, 23, 162, 4, 93 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("044ecf10-f1eb-4594-a2a7-cd4d5ba56355"), new DateTime(2025, 7, 7, 15, 27, 43, 793, DateTimeKind.Utc).AddTicks(7060), "Default Vault", null, new Guid("bffe53c5-f989-d5b7-9a55-0dca3d4d9df9") });

            migrationBuilder.AddForeignKey(
                name: "fk_logins_vaults_vault_id",
                table: "logins",
                column: "vault_id",
                principalTable: "vaults",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
