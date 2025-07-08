using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IVaultRepository
{
    Task<bool> VaultExistsByUserIdAsync(Guid id, Guid userId);
    Task<bool> VaultExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    Task<Vault?> GetVaultAsync(Guid id);
    Task<List<Vault>> GetVaultsByUserIdAsync(Guid userId);
    Task<Vault> CreateVaultAsync(Vault vault);
    Task<Vault> UpdateVaultAsync(Vault vault);
    Task<int> DeleteVaultAsync(Guid id);
}