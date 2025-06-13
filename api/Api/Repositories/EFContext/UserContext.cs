using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class UserContext(DbContextOptions<UserContext> options): DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }
}