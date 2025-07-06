using Api.Entities;
using Api.Extensions;
using Api.Helpers;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Vault> Vaults { get; set; }
    public virtual DbSet<Login> Logins { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    private readonly User _setupUser = new User
    {
        Id = Guid.NewGuid(),
        Created = DateTime.UtcNow,
        // {Username: "q", Password "q"}
        UsernameHash =
            "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5",
        PasswordHash = "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g",
        Salt = CryptoHelper.GenerateRandomByte(UserService.UserSaltLengthInBytes)
    };
    
    private void SetupUserEntity(ModelBuilder modelBuilder)
    {
        var user = 
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Salt)
                .HasColumnType("binary(16)")
                .IsRequired();
            entity.HasData(new List<User> { _setupUser });
        });
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UsernameHash)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasMany<Vault>()
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
    
    private void SetupLoginEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Login>(entity =>
        {
            entity.Property(l => l.EncryptedData)
                .HasColumnType("Blob");
            entity.Property(l => l.InitializationVector)
                .HasColumnType("TinyBlob");
        });
        modelBuilder.Entity<Login>()
            .HasMany(e => e.Tags)
            .WithMany();
        modelBuilder.Entity<Login>()
            .HasOne<Vault>()
            .WithMany()
            .HasForeignKey(l => l.VaultId)
            .OnDelete(DeleteBehavior.Cascade);
    }
    
    private void SetupVaultEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vault>(entity =>
        {
            entity.HasData(new Vault
            {
                Id = Guid.NewGuid(),
                UserId = _setupUser.Id,
                Name = "Default Vault",
                Created = DateTime.UtcNow
            });
        });
    }

    private void SetupRefreshTokenEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>()
            .HasOne<User>()
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.SetupLoginEntity();
        modelBuilder.SetupUserEntity();
        modelBuilder.SetupVaultEntity();
        modelBuilder.SetupRefreshTokenEntity();
        modelBuilder.SetupColumnAndTableNames();
    }
}