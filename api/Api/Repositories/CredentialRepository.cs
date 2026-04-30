using Api.Entities;
using Api.Helpers;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class CredentialRepository(AppDbContext db) : ICredentialRepository
{
    public async Task<bool> ExistsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Logins
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.UserId == userId)
            .AnyAsync();
    }

    public async Task<bool> ExistsByVaultIdAsync(Guid id, Guid vaultId)
    {
        return await db.Logins
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.VaultId == vaultId);
    }

    public async Task<bool> ExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId)
    {
        return await db.Logins
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.VaultId == vaultId)
            .AnyAsync();
    }

    public async Task<Login?> GetWithTagsAsync(Guid id)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Login>> GetByUserIdWithTagsAsync(Guid userId, bool deleted = false)
    {
        return await db.Logins
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId && l.Deleted == deleted)
            .ToListAsync();
    }

    public async Task<List<Login>> GetByVaultIdWithTagsAsync(Guid vaultId)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .Where(l => l.VaultId == vaultId && l.Deleted == false)
            .ToListAsync();
    }

    public async Task<List<Login>> GetByIdsWithTagsAsync(IEnumerable<Guid> ids)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .Where(l => ids.Contains(l.Id))
            .ToListAsync();
    }

    public async Task<Login> CreateAsync(Login login)
    {
        login.Created = DateTime.UtcNow;
        login.Id = CryptoHelper.GenerateSecureGuid();
        await db.Logins.AddAsync(login);
        await db.SaveChangesAsync();
        return login;
    }

    public async Task<List<Login>> CreateAsync(List<Login> logins)
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

    public async Task<Login> UpdateAsync(Login login)
    {
        login.Updated = DateTime.UtcNow;
        db.Logins.Update(login);
        await db.SaveChangesAsync();
        return login;
    }

    public async Task<List<Login>> UpdateAsync(List<Login> logins)
    {
        var now = DateTime.UtcNow;
        logins.ForEach(l => l.Updated = now);
        db.Logins.UpdateRange(logins);
        await db.SaveChangesAsync();
        return logins;
    }

    public async Task<int> DeleteAsync(Guid id)
    {
        return await db.Logins
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync();
    }

    public async Task<int> DeleteAsync(IEnumerable<Guid> ids)
    {
        return await db.Logins
            .Where(x => ids.Contains(x.Id))
            .ExecuteDeleteAsync();
    }
}