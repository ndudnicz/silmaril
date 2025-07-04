using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IVaultRepository
{
    public Task<Vault?> GetVaultAsync(Guid id);
    public Task<List<Vault>> GetVaultsAsync();
    public Task<Vault> CreateVaultAsync(Vault vault);
    public Task<Vault> UpdateVaultAsync(Vault vault);
    public Task<int> DeleteVaultAsync(Guid id);
}