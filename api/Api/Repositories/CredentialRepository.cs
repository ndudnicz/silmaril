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
        return await db.Credentials
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Credentials
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.UserId == userId)
            .AnyAsync();
    }

    public async Task<bool> ExistsByVaultIdAsync(Guid id, Guid vaultId)
    {
        return await db.Credentials
            .AsNoTracking()
            .AnyAsync(x => x.Id == id && x.VaultId == vaultId);
    }

    public async Task<bool> ExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId)
    {
        return await db.Credentials
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.VaultId == vaultId)
            .AnyAsync();
    }

    public async Task<Credential?> GetWithTagsAsync(Guid id)
    {
        return await db.Credentials
            .Include(l => l.Tags)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Credential>> GetByUserIdWithTagsAsync(Guid userId, bool deleted = false)
    {
        return await db.Credentials
            .AsNoTracking()
            .Include(l => l.Tags)
            .Where(l => l.UserId == userId && l.Deleted == deleted)
            .ToListAsync();
    }

    public async Task<List<Credential>> GetByVaultIdWithTagsAsync(Guid vaultId)
    {
        return await db.Credentials
            .Include(l => l.Tags)
            .Where(l => l.VaultId == vaultId && l.Deleted == false)
            .ToListAsync();
    }

    public async Task<List<Credential>> GetByIdsWithTagsAsync(IEnumerable<Guid> ids)
    {
        return await db.Credentials
            .Include(l => l.Tags)
            .Where(l => ids.Contains(l.Id))
            .ToListAsync();
    }

    public async Task<Credential> CreateAsync(Credential credential)
    {
        credential.Created = DateTime.UtcNow;
        credential.Id = CryptoHelper.GenerateSecureGuid();
        await db.Credentials.AddAsync(credential);
        await db.SaveChangesAsync();
        return credential;
    }

    public async Task<List<Credential>> CreateAsync(List<Credential> credentials)
    {
        var now = DateTime.UtcNow;
        credentials.ForEach(l =>
        {
            l.Created = now;
            l.Id = CryptoHelper.GenerateSecureGuid();
        });
        await db.Credentials.AddRangeAsync(credentials);
        await db.SaveChangesAsync();
        return credentials;
    }

    public async Task<Credential> UpdateAsync(Credential credential)
    {
        credential.Updated = DateTime.UtcNow;
        db.Credentials.Update(credential);
        await db.SaveChangesAsync();
        return credential;
    }

    public async Task<List<Credential>> UpdateAsync(List<Credential> credentials)
    {
        var now = DateTime.UtcNow;
        credentials.ForEach(l => l.Updated = now);
        db.Credentials.UpdateRange(credentials);
        await db.SaveChangesAsync();
        return credentials;
    }

    public async Task<int> DeleteAsync(Guid id)
    {
        return await db.Credentials
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync();
    }

    public async Task<int> DeleteAsync(IEnumerable<Guid> ids)
    {
        return await db.Credentials
            .Where(x => ids.Contains(x.Id))
            .ExecuteDeleteAsync();
    }
}