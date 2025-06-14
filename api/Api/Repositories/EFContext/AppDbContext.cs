using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Login> Logins { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany<Login>()
            .WithOne();
        modelBuilder.Entity<Login>()
            .HasMany(e => e.Tags)
            .WithMany();

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // Table name
            entity.SetTableName(ToLowerSnakeCase(entity.GetTableName()));
        
            // Colonnes
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToLowerSnakeCase(property.Name));
            }
            
            // Clés primaires et étrangères
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
            for (int i = 0; i < name.Length; i++)
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