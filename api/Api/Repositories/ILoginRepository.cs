using Api.Entities;

namespace Api.Repositories;

public interface ILoginRepository
{
    public Task<Login?> GetLoginAsync(int id);
    public Task<Login?> GetLoginWithTagsAsync(int id);
    public Task<Login> UpdateLoginAsync(Login login);
}