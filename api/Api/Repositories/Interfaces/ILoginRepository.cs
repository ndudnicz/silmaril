using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ILoginRepository
{
    public Task<bool> LoginExistsByUserIdAsync(Guid id, Guid userId);
    public Task<bool> LoginsExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    public Task<bool> LoginExistsByVaultIdAsync(Guid id, Guid vaultId);
    public Task<bool> LoginsExistByVaultIdAsync(IEnumerable<Guid> ids, Guid vaultId);
    public Task<Login?> GetLoginWithTagsAsync(Guid id);
    public Task<List<Login>> GetLoginsWithTagsAsync(IEnumerable<Guid> ids);
    public Task<List<Login>> GetLoginsByVaultIdWithTagsAsync(Guid vaultId);
    public Task<List<Login>> GetLoginsByUserIdWithTagsAsync(Guid userId, bool deleted = false);
    public Task<Login> CreateLoginAsync(Login login);
    public Task<List<Login>> CreateLoginsAsync(List<Login> logins);
    public Task<Login> UpdateLoginAsync(Login login);
    public Task<List<Login>> UpdateLoginsAsync(List<Login> logins);
    public Task<int> DeleteLoginAsync(Guid id);
    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
    public Task<int> DeleteLoginsAsync(IEnumerable<Guid> ids);
    public Task<int> DeleteLoginsByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
}