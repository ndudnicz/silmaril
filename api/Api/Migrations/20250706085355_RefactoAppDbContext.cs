using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactoAppDbContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("a93f1b66-8ffb-4f0b-9959-ed12586c2881"));

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f"), new DateTime(2025, 7, 6, 8, 53, 54, 894, DateTimeKind.Utc).AddTicks(4470), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 139, 113, 56, 188, 210, 170, 85, 70, 179, 174, 181, 11, 101, 122, 86, 16 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("f7a4597a-0293-4ef1-af45-bd9882055a35"), new DateTime(2025, 7, 6, 8, 53, 55, 11, DateTimeKind.Utc).AddTicks(8550), "Default Vault", null, new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "vaults",
                keyColumn: "id",
                keyValue: new Guid("f7a4597a-0293-4ef1-af45-bd9882055a35"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("9e3da8cf-3451-43cd-922b-209b6db9f42f"));

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("a93f1b66-8ffb-4f0b-9959-ed12586c2881"), new DateTime(2025, 7, 5, 13, 26, 54, 537, DateTimeKind.Utc).AddTicks(8680), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 47, 127, 42, 112, 128, 90, 76, 129, 61, 243, 242, 251, 114, 228, 240, 167 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });
        }
    }
}
