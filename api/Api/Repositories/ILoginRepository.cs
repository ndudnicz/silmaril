using Api.Entities;

namespace Api.Repositories;

public interface ILoginRepository
{
    public Task<Login> GetLoginAsync(Guid id);
    public Task<Login> GetLoginWithTagsAsync(Guid id);
    public Task<Login> GetLoginWithTagsByUserIdAsync(Guid id, Guid userId);
    public Task<IEnumerable<Login>> GetLoginsWithTagsByUserIdAsync(Guid userId);
    public Task<Login> CreateLoginAsync(Login login);
    public Task<Login> UpdateLoginAsync(Login login);
    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
}