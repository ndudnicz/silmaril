using Api.Entities;
using Api.Helpers;
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
    
    public async Task<bool> LoginExistsByVaultIdAsync(Guid id, Guid vaultId)
    {
        return await db.Logins
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.VaultId == vaultId);
    }
    
    public async Task<bool> LoginsExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId)
    {
        return await db.Logins
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.VaultId == vaultId)
            .AnyAsync();
    }
    
    public async Task<Login?> GetLoginWithTagsAsync(Guid id)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Login>> GetLoginsByUserIdWithTagsAsync(Guid userId, bool deleted = false)
    {
        return await db.Logins
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId && l.Deleted == deleted)
            .ToListAsync();
    }

    public async Task<List<Login>> GetLoginsByVaultIdWithTagsAsync(Guid vaultId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .Where(l => l.VaultId == vaultId && l.Deleted == false)
            .ToListAsync();
    }
    
    public async Task<List<Login>> GetLoginsWithTagsAsync(IEnumerable<Guid> ids)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .Where(l => ids.Contains(l.Id))
            .ToListAsync();
    }
    
    public async Task<Login> CreateLoginAsync(Login login)
    {
        login.Created = DateTime.UtcNow;
        login.Id = CryptoHelper.GenerateSecureGuid();
        await db.Logins.AddAsync(login);
        await db.SaveChangesAsync();
        return login;
    }

    public async Task<List<Login>> CreateLoginsAsync(List<Login> logins)
    {
        var now = DateTime.UtcNow;
        logins.ForEach(l =>
        {
            l.Created = now;
            l.Id = CryptoHelper.GenerateSecureGuid();
        });
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
    
    public async Task<int> DeleteLoginAsync(Guid id)
    {
        return await db.Logins
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync();
    }
    
    public async Task<int> DeleteLoginsAsync(IEnumerable<Guid> ids)
    {
        return await db.Logins
            .Where(x => ids.Contains(x.Id))
            .ExecuteDeleteAsync();
    }
}