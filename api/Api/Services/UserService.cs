using Api.Entities;
using Api.Repositories;

namespace Api.Services;

public class UserService(IUserRepository userRepository): IUserService
{
    public async Task<User?> GetUserByUserNameAsync(string username)
    {
        return await userRepository.GetUserByUserNameAsync(username);
    }
}