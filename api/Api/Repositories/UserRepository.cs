using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class UserRepository(AppDbContext db): IUserRepository
{
    public async Task<User?> GetUserByUserNameAsync(string username)
    {
        return await db.Users.FirstOrDefaultAsync(x => x.Username == username);
    }
}