using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class UserRepository(AppDbContext db): IUserRepository
{
    public async Task<User?> GetUserAsync(Guid id)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.Id == id);
    }
    
    public async Task<User?> GetUserByUserNameAsync(string usernameHash)
    {
        return await db.Users.FirstOrDefaultAsync(x => x.UsernameHash == usernameHash);
    }
    
    public async Task<bool> UserExistsAsync(Guid id)
    {
        return await db.Users
            .AsNoTracking()
            .AnyAsync(x => x.Id == id);
    }
    
    public async Task<bool> UserExistsByUsernameHashAsync(string usernameHash)
    {
        return await db.Users
            .AsNoTracking()
            .AnyAsync(x => x.UsernameHash == usernameHash);
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