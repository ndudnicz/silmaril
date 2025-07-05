using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserAsync(Guid id);
    Task<User?> GetUserByUserNameAsync(string usernameHash);
    Task<bool> UserExistsAsync(Guid id);
    Task<bool> UserExistsByUsernameHashAsync(string usernameHash);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task<int> DeleteUserAsync(User user);
}