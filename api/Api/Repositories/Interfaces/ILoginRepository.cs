using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ILoginRepository
{
    public Task<bool> LoginExistsByUserIdAsync(Guid id, Guid userId);
    public Task<bool> LoginsExistByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
    public Task<Login?> GetLoginWithTagsByUserIdAsync(Guid id, Guid userId);
    public Task<List<Login>> GetLoginsWithTagsByUserIdAsync(Guid userId, bool deleted = false);
    public Task<List<Login>> GetLoginsByIdsAndUserIdWithTagsAsync(IEnumerable<Guid> ids, Guid userId);
    public Task<Login> CreateLoginAsync(Login login);
    public Task<List<Login>> CreateLoginsAsync(List<Login> logins);
    public Task<Login> UpdateLoginAsync(Login login);
    public Task<List<Login>> UpdateLoginsAsync(List<Login> logins);
    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
    public Task<int> DeleteLoginsByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
}