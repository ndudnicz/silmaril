using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddManuallyGeneratedId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "vaults",
                keyColumn: "id",
                keyValue: new Guid("c5aaa345-047c-4f95-8073-44ed63906c50"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3"));

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("bffe53c5-f989-d5b7-9a55-0dca3d4d9df9"), new DateTime(2025, 7, 7, 15, 27, 43, 675, DateTimeKind.Utc).AddTicks(8010), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 249, 219, 140, 250, 128, 4, 70, 207, 35, 211, 96, 44, 23, 162, 4, 93 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("044ecf10-f1eb-4594-a2a7-cd4d5ba56355"), new DateTime(2025, 7, 7, 15, 27, 43, 793, DateTimeKind.Utc).AddTicks(7060), "Default Vault", null, new Guid("bffe53c5-f989-d5b7-9a55-0dca3d4d9df9") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                values: new object[] { new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3"), new DateTime(2025, 7, 7, 15, 9, 33, 662, DateTimeKind.Utc).AddTicks(7010), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 133, 201, 169, 91, 198, 103, 161, 95, 175, 127, 41, 182, 62, 48, 152, 92 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("c5aaa345-047c-4f95-8073-44ed63906c50"), new DateTime(2025, 7, 7, 15, 9, 33, 780, DateTimeKind.Utc).AddTicks(1720), "Default Vault", null, new Guid("ca770ff3-6698-426a-a264-84cd46de5ea3") });
        }
    }
}
