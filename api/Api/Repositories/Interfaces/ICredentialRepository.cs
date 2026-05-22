using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ICredentialRepository
{
    Task<bool> ExistsByUserIdAsync(Guid id, Guid userId);
    Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    Task<bool> ExistsByVaultIdAsync(Guid id, Guid vaultId);
    Task<bool> ExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId);

    Task<Credential?> GetWithTagsAsync(Guid id);
    Task<List<Credential>> GetByIdsWithTagsAsync(IEnumerable<Guid> ids);
    Task<List<Credential>> GetByVaultIdWithTagsAsync(Guid vaultId);
    Task<List<Credential>> GetByUserIdWithTagsAsync(Guid userId, bool deleted = false);


    Task<Credential> CreateAsync(Credential credential);
    Task<List<Credential>> CreateAsync(List<Credential> credentials);

    Task<Credential> UpdateAsync(Credential credential);
    Task<List<Credential>> UpdateAsync(List<Credential> credentials);

    Task<int> DeleteAsync(Guid id);
    Task<int> DeleteAsync(IEnumerable<Guid> ids);
}