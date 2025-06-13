using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class LoginTagContext(DbContextOptions<LoginTagContext> options): DbContext(options)
{
    public virtual DbSet<LoginTag> LoginTags { get; set; }
}