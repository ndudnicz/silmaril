using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ICredentialRepository
{
    Task<bool> ExistsByUserIdAsync(Guid id, Guid userId);
    Task<bool> ExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    Task<bool> ExistsByVaultIdAsync(Guid id, Guid vaultId);
    Task<bool> ExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId);

    Task<Login?> GetWithTagsAsync(Guid id);
    Task<List<Login>> GetByIdsWithTagsAsync(IEnumerable<Guid> ids);
    Task<List<Login>> GetByVaultIdWithTagsAsync(Guid vaultId);
    Task<List<Login>> GetByUserIdWithTagsAsync(Guid userId, bool deleted = false);


    Task<Login> CreateAsync(Login login);
    Task<List<Login>> CreateAsync(List<Login> logins);

    Task<Login> UpdateAsync(Login login);
    Task<List<Login>> UpdateAsync(List<Login> logins);

    Task<int> DeleteAsync(Guid id);
    Task<int> DeleteAsync(IEnumerable<Guid> ids);
}