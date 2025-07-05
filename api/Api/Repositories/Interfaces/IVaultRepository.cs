using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IVaultRepository
{
    public Task<bool> VaultExistsByUserIdAsync(Guid id, Guid userId);
    public Task<bool> VaultExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    public Task<Vault?> GetVaultAsync(Guid id);
    public Task<Vault> CreateVaultAsync(Vault vault);
    public Task<Vault> UpdateVaultAsync(Vault vault);
    public Task<int> DeleteVaultAsync(Guid id);
}