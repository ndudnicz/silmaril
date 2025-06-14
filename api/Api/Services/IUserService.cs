using Api.Entities;

namespace Api.Services;

public interface IUserService
{
    public Task<User> GetUserByUserNameAsync(string username);
    public Task<User> GetUserAsync(int id);
}