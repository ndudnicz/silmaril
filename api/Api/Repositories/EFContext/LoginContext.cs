using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.EFContext;

public partial class LoginContext(DbContextOptions<LoginContext> options): DbContext(options)
{
    public string TableName => "logins";
    public virtual DbSet<Login> Logins { get; set; }
}