using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class TagContext(DbContextOptions<TagContext> options): DbContext(options)
{
    public virtual DbSet<Tag> Tags { get; set; }
}