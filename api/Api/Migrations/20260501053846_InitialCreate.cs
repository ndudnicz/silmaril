using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    salt = table.Column<byte[]>(type: "bytea", nullable: false),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    expires = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vaults",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "logins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    encrypted_data = table.Column<byte[]>(type: "bytea", nullable: true),
                    encryption_version = table.Column<int>(type: "integer", nullable: true),
                    initialization_vector = table.Column<byte[]>(type: "bytea", nullable: true),
                    deleted = table.Column<bool>(type: "boolean", nullable: false),
                    vault_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_logins", x => x.id);
                    table.ForeignKey(
                        name: "fk_logins_vaults_vault_id",
                        column: x => x.vault_id,
                        principalTable: "vaults",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "login_tag",
                columns: table => new
                {
                    login_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tags_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_login_tag", x => new { x.login_id, x.tags_id });
                    table.ForeignKey(
                        name: "fk_login_tag_logins_login_id",
                        column: x => x.login_id,
                        principalTable: "logins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_login_tag_tags_tags_id",
                        column: x => x.tags_id,
                        principalTable: "tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created", "password_hash", "salt", "updated", "username_hash" },
                values: new object[] { new Guid("e2d7412c-47c3-0504-b436-9c5fe26b70d8"), new DateTime(2026, 5, 1, 5, 38, 45, 749, DateTimeKind.Utc).AddTicks(9730), "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g", new byte[] { 159, 130, 1, 64, 74, 85, 128, 6, 110, 137, 172, 44, 5, 55, 92, 142 }, null, "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5" });

            migrationBuilder.InsertData(
                table: "vaults",
                columns: new[] { "id", "created", "name", "updated", "user_id" },
                values: new object[] { new Guid("e8a91207-f378-4ab8-86e3-17c7474f2c5c"), new DateTime(2026, 5, 1, 5, 38, 45, 752, DateTimeKind.Utc).AddTicks(3380), "Default Vault", null, new Guid("e2d7412c-47c3-0504-b436-9c5fe26b70d8") });

            migrationBuilder.CreateIndex(
                name: "ix_login_tag_tags_id",
                table: "login_tag",
                column: "tags_id");

            migrationBuilder.CreateIndex(
                name: "ix_logins_vault_id",
                table: "logins",
                column: "vault_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_username_hash",
                table: "users",
                column: "username_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vaults_user_id",
                table: "vaults",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "login_tag");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "logins");

            migrationBuilder.DropTable(
                name: "tags");

            migrationBuilder.DropTable(
                name: "vaults");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
