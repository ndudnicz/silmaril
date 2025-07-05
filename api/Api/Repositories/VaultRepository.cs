using Api.Entities;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class VaultRepository(AppDbContext db): IVaultRepository
{
    public async Task<bool> VaultExistsByUserIdAsync(Guid id, Guid userId)
    {
        return await db.Vaults
            .AsNoTracking()
            .AnyAsync(v => v.Id == id && v.UserId == userId);
    }
    
    public async Task<bool> VaultExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        return await db.Vaults
            .AsNoTracking()
            .Where(v => ids.Contains(v.Id) && v.UserId == userId)
            .AnyAsync();
    }

    public async Task<Vault?> GetVaultAsync(Guid id)
    {
        return await db.Vaults
            .FirstOrDefaultAsync(v => v.Id == id);
    }
    
    public async Task<List<Vault>> GetVaultsByUserIdAsync(Guid userId)
    {
        return await db.Vaults
            .Where(v => v.UserId == userId)
            .ToListAsync();
    }

    public async Task<Vault> CreateVaultAsync(Vault vault)
    {
        vault.Created = DateTime.Now;
        await db.Vaults.AddAsync(vault);
        await db.SaveChangesAsync();
        return vault;
    }
    
    public async Task<Vault> UpdateVaultAsync(Vault vault)
    {
        vault.Updated = DateTime.Now;
        db.Vaults.Update(vault);
        await db.SaveChangesAsync();
        return vault;
    }

    public async Task<int> DeleteVaultAsync(Guid id)
    {
        return await db.Vaults
            .Where(v => v.Id == id)
            .ExecuteDeleteAsync();
    }
}