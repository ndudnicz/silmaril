using Api.Entities;
using Api.Repositories;
using Api.Services.Exceptions;

namespace Api.Services;

public class UserService(IUserRepository userRepository): IUserService
{
    public async Task<User> GetUserAsync(int id)
    {
        var user = await userRepository.GetUserAsync(id);
        if (user == null)
        {
            throw new UserNotFound(id);
        }
        return user;
    }
    
    public async Task<User> GetUserByUserNameAsync(string username)
    {
        var user = await userRepository.GetUserByUserNameAsync(username);
        if (user == null)
        {
            throw new UserNameNotFound(username);
        }
        return user;
    }
}