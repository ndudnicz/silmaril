using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetAsync(Guid id);
    Task<User?> GetByUserNameHashAsync(string usernameHash);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> ExistsByUsernameHashAsync(string usernameHash);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<int> DeleteAsync(User user);
}