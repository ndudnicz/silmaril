using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class LoginRepository(AppDbContext db): ILoginRepository
{
    public async Task<Login> GetLoginAsync(Guid id)
    {
        return await db.Logins
            .FirstAsync(x => x.Id == id);
    }
    
    public async Task<Login> GetLoginWithTagsAsync(Guid id)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstAsync(x => x.Id == id);
    }

    public async Task<Login> GetLoginWithByUserIdTagsAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<IEnumerable<Login>> GetLoginsWithByUserIdTagsAsync(Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId)
            .ToListAsync();
    }
    
    public async Task<Login> CreateLoginAsync(Login login)
    {
        login.Created = DateTime.UtcNow;
        await db.Logins.AddAsync(login);
        await db.SaveChangesAsync();
        return login;
    }
    
    public async Task<Login> UpdateLoginAsync(Login login)
    {
        login.Updated = DateTime.UtcNow;
        db.Logins.Update(login);
        await db.SaveChangesAsync();
        return login;
    }
}