using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IVaultRepository
{
    Task<bool> ExistsByUserIdAsync(Guid id, Guid userId);
    Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    Task<int> CountByUserIdAsync(Guid userId);

    Task<Vault?> GetAsync(Guid id);
    Task<List<Vault>> GetByUserIdAsync(Guid userId);

    Task<Vault> CreateAsync(Vault vault);

    Task<Vault> UpdateAsync(Vault vault);

    Task<int> DeleteAsync(Guid id);
}