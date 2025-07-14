using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ILoginRepository
{
    Task<bool> LoginExistsByUserIdAsync(Guid id, Guid userId);
    Task<bool> LoginsExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    Task<bool> LoginExistsByVaultIdAsync(Guid id, Guid vaultId);
    Task<bool> LoginsExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId);
    
    Task<Login?> GetLoginWithTagsAsync(Guid id);
    Task<List<Login>> GetLoginsWithTagsAsync(IEnumerable<Guid> ids);
    Task<List<Login>> GetLoginsByVaultIdWithTagsAsync(Guid vaultId);
    Task<List<Login>> GetLoginsByUserIdWithTagsAsync(Guid userId, bool deleted = false);

    
    Task<Login> CreateLoginAsync(Login login);
    Task<List<Login>> CreateLoginsAsync(List<Login> logins);
    
    Task<Login> UpdateLoginAsync(Login login);
    Task<List<Login>> UpdateLoginsAsync(List<Login> logins);
    
    Task<int> DeleteLoginAsync(Guid id);
    Task<int> DeleteLoginsAsync(IEnumerable<Guid> ids);
}