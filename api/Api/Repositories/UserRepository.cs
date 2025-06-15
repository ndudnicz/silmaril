using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class UserRepository(AppDbContext db): IUserRepository
{
    public async Task<User> GetUserAsync(Guid id)
    {
        return await db.Users.FirstAsync(u => u.Id == id);
    }
    
    public async Task<User> GetUserByUserNameAsync(string username)
    {
        return await db.Users.FirstAsync(x => x.Username == username);
    }
    
    public async Task<bool> UserExistsAsync(Guid id)
    {
        return await db.Users
            .AsNoTracking()
            .AnyAsync(x => x.Id == id);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        user.Created = DateTime.Now;
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        user.Updated = DateTime.Now;
        db.Users.Update(user);
        await db.SaveChangesAsync();
        return user;
    }
}