using Api.Entities;

namespace Api.Repositories;

public interface IUserRepository
{
    public Task<User?> GetUserByUserNameAsync(string username);
}