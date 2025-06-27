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

    public async Task<Login> GetLoginWithTagsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<List<Login>> GetLoginsWithTagsByUserIdAsync(Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId)
            .ToListAsync();
    }

    public async Task<List<Login>> GetLoginsWithTagsByUserIdBulkAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId && ids.Contains(l.Id))
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
    
    public async Task<List<Login>> UpdateLoginBulkAsync(List<Login> logins)
    {
        var now = DateTime.UtcNow;
        foreach (var login in logins)
        {
            login.Updated = now;
        }

        db.Logins.UpdateRange(logins);
        await db.SaveChangesAsync();
        return logins;
    }
    
    public async Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .Where(x => x.UserId == id && x.Id == userId)
            .ExecuteDeleteAsync();
    }
}