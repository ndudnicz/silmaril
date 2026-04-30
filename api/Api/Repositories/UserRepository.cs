using Api.Entities;
using Api.Helpers;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public async Task<User?> GetAsync(Guid id)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByUserNameHashAsync(string usernameHash)
    {
        return await db.Users.FirstOrDefaultAsync(x => x.UsernameHash == usernameHash);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await db.Users
            .AsNoTracking()
            .AnyAsync(x => x.Id == id);
    }

    public async Task<bool> ExistsByUsernameHashAsync(string usernameHash)
    {
        return await db.Users
            .AsNoTracking()
            .AnyAsync(x => x.UsernameHash == usernameHash);
    }

    public async Task<User> CreateAsync(User user)
    {
        user.Created = DateTime.Now;
        user.Id = CryptoHelper.GenerateSecureGuid();
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.Updated = DateTime.Now;
        db.Users.Update(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task<int> DeleteAsync(User user)
    {
        return await db.Users
            .Where(u => u.Id == user.Id)
            .ExecuteDeleteAsync();
    }
}