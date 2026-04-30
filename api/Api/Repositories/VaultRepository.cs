using Api.Entities;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class VaultRepository(AppDbContext db) : IVaultRepository
{
    public async Task<bool> ExistsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Vaults
            .AsNoTracking()
            .AnyAsync(v => v.Id == id && v.UserId == userId);
    }

    public async Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        var distinctIds = ids.Distinct().ToList();
        if (distinctIds.Count == 0)
        {
            return false;
        }

        var matchingIdsCount = await db.Vaults
            .AsNoTracking()
            .Where(v => v.UserId == userId && distinctIds.Contains(v.Id))
            .Select(v => v.Id)
            .Distinct()
            .CountAsync();

        return matchingIdsCount == distinctIds.Count;
    }

    public async Task<int> CountByUserIdAsync(Guid userId)
    {
        return await db.Vaults
            .AsNoTracking()
            .CountAsync(v => v.UserId == userId);
    }

    public async Task<Vault?> GetAsync(Guid id)
    {
        return await db.Vaults
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<List<Vault>> GetByUserIdAsync(Guid userId)
    {
        return await db.Vaults
            .Where(v => v.UserId == userId)
            .ToListAsync();
    }

    public async Task<Vault> CreateAsync(Vault vault)
    {
        vault.Created = DateTime.Now;
        await db.Vaults.AddAsync(vault);
        await db.SaveChangesAsync();
        return vault;
    }

    public async Task<Vault> UpdateAsync(Vault vault)
    {
        vault.Updated = DateTime.Now;
        db.Vaults.Update(vault);
        await db.SaveChangesAsync();
        return vault;
    }

    public async Task<int> DeleteAsync(Guid id)
    {
        return await db.Vaults
            .Where(v => v.Id == id)
            .ExecuteDeleteAsync();
    }
}