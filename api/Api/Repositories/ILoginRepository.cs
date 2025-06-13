using Api.Entities;

namespace Api.Repositories;

public interface ILoginRepository
{
    public Task<Login?> GetLoginAsync(int id);
}