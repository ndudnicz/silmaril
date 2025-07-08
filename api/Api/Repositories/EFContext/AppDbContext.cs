using Api.Entities;
using Api.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Vault> Vaults { get; set; }
    public virtual DbSet<Login> Logins { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.SetupLoginEntity();
        modelBuilder.SetupUserEntity();
        modelBuilder.SetupVaultEntity();
        modelBuilder.SetupRefreshTokenEntity();
        modelBuilder.SetupColumnAndTableNames();
    }
}