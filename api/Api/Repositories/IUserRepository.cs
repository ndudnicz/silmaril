using Api.Entities;

namespace Api.Repositories;

public interface IUserRepository
{
    public Task<User> GetUserAsync(Guid id);
    public Task<User> GetUserByUserNameAsync(string username);
    public Task<bool> UserExistsAsync(Guid id);
    public Task<bool> UserExistsAsync(string usernameHash);
    public Task<User> CreateUserAsync(User user);
    public Task<User> UpdateUserAsync(User user);
}