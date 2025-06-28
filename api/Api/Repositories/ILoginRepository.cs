using Api.Entities;

namespace Api.Repositories;

public interface ILoginRepository
{
    public Task<Login> GetLoginWithTagsByUserIdAsync(Guid id, Guid userId);
    public Task<List<Login>> GetLoginsWithTagsByUserIdAsync(Guid userId);
    public Task<List<Login>> GetLoginsWithTagsByUserIdBulkAsync(IEnumerable<Guid> ids, Guid userId);
    public Task<Login> CreateLoginAsync(Login login);
    public Task<Login> UpdateLoginAsync(Login login);
    public Task<List<Login>> UpdateLoginsAsync(List<Login> logins);
    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
}