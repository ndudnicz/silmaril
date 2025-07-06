using Api.Entities;
using Api.Helpers;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Extensions;

public static class ModelBuilderExtensions
{
    private static readonly User SetupUser = new User
    {
        Id = Guid.NewGuid(),
        Created = DateTime.UtcNow,
        // {Username: "q", Password "q"}
        UsernameHash = "2E96772232487FB3A058D58F2C310023E07E4017C94D56CC5FAE4B54B44605F42A75B0B1F358991F8C6CBE9B68B64E5B2A09D0AD23FCAC07EE9A9198A745E1D5",
        PasswordHash = "$argon2id$v=19$m=16,t=2,p=1$ZEp5eWdQeDBXeGk2OWh6Qw$/sfpIugCYAcUqDG3xmx/2g",
        Salt = CryptoHelper.GenerateRandomByte(UserService.UserSaltLengthInBytes)
    };
    
    public static void SetupUserEntity(this ModelBuilder modelBuilder)
    {
        var user = 
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Salt)
                .HasColumnType("binary(16)")
                .IsRequired();
            entity.HasData(new List<User> { SetupUser });
        });
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UsernameHash)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasMany<Vault>()
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
    
    public static void SetupLoginEntity(this ModelBuilder modelBuilder)
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
    
    public static void SetupVaultEntity(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vault>(entity =>
        {
            entity.HasData(new Vault
            {
                Id = Guid.NewGuid(),
                UserId = SetupUser.Id,
                Name = "Default Vault",
                Created = DateTime.UtcNow
            });
        });
    }

    public static void SetupRefreshTokenEntity(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>()
            .HasOne<User>()
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }

    // Rename tables and columns to lower snake_case
    public static void SetupColumnAndTableNames(this ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToLowerSnakeCase(entity.GetTableName()));
        
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToLowerSnakeCase(property.Name));
            }
            
            foreach (var key in entity.GetKeys())
            {
                key.SetName(key.GetName().ToLower());
            }
        
            foreach (var fk in entity.GetForeignKeys())
            {
                fk.SetConstraintName(fk.GetConstraintName().ToLower());
            }
        
            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(index.GetDatabaseName().ToLower());
            }
        }

        return;
        
        string ToLowerSnakeCase(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return name;

            var builder = new System.Text.StringBuilder();
            for (var i = 0; i < name.Length; i++)
            {
                var c = name[i];
                if (char.IsUpper(c))
                {
                    if (i > 0)
                        builder.Append('_');

                    builder.Append(char.ToLower(c));
                }
                else
                {
                    builder.Append(c);
                }
            }

            return builder.ToString();
        }
    }
}