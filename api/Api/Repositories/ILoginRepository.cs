using Api.Entities;

namespace Api.Repositories;

public interface ILoginRepository
{
    public Task<Login> GetLoginAsync(Guid id);
    public Task<Login> GetLoginWithTagsAsync(Guid id);
    public Task<Login> GetLoginWithByUserIdTagsAsync(Guid id, Guid userId);
    public Task<IEnumerable<Login>> GetLoginsWithByUserIdTagsAsync(Guid userId);
    public Task<Login> CreateLoginAsync(Login login);
    public Task<Login> UpdateLoginAsync(Login login);
}