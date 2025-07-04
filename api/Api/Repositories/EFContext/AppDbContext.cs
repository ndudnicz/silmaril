using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Login> Logins { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Salt)
                .HasColumnType("binary(16)")
                .IsRequired();
        });
        modelBuilder.Entity<Login>(entity =>
        {
            entity.Property(l => l.EncryptedData)
                .HasColumnType("Blob");
            entity.Property(l => l.InitializationVector)
                .HasColumnType("TinyBlob");
        });
        modelBuilder.Entity<User>()
            .HasMany<Login>()
            .WithOne();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UsernameHash)
            .IsUnique();
        modelBuilder.Entity<Login>()
            .HasMany(e => e.Tags)
            .WithMany();
        modelBuilder.Entity<RefreshToken>()
            .HasOne<User>()
            .WithOne();

        // Rename tables and columns to lower snake_case
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