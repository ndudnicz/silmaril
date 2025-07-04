using Api.Entities;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class LoginRepository(AppDbContext db): ILoginRepository
{
    public async Task<bool> LoginExistsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.UserId == userId);
    }
    
    public async Task<bool> LoginsExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.UserId == userId)
            .AnyAsync();
    }
    
    public async Task<Login?> GetLoginWithTagsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<List<Login>> GetLoginsWithTagsByUserIdAsync(Guid userId, bool deleted = false)
    {
        return await db.Logins
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId && l.Deleted == deleted)
            .ToListAsync();
    }

    public async Task<List<Login>> GetLoginsByIdsAndUserIdWithTagsAsync(IEnumerable<Guid> ids, Guid userId)
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

    public async Task<List<Login>> CreateLoginsAsync(List<Login> logins)
    {
        var now = DateTime.UtcNow;
        logins.ForEach(l => l.Created = now);
        await db.Logins.AddRangeAsync(logins);
        await db.SaveChangesAsync();
        return logins;
    }
    
    public async Task<Login> UpdateLoginAsync(Login login)
    {
        login.Updated = DateTime.UtcNow;
        db.Logins.Update(login);
        await db.SaveChangesAsync();
        return login;
    }
    
    public async Task<List<Login>> UpdateLoginsAsync(List<Login> logins)
    {
        var now = DateTime.UtcNow;
        logins.ForEach(l => l.Updated = now);
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

    public async Task<int> DeleteLoginsByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Logins
            .Where(x => x.UserId == userId && ids.Contains(x.Id))
            .ExecuteDeleteAsync();
    }
}