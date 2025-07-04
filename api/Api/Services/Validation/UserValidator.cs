using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class UserValidator(IUserRepository userRepository) : IUserValidator
{
    public async Task EnsureExistsAsync(Guid id)
    {
        if (!await userRepository.UserExistsAsync(id))
        {
            throw new UserNotFound("id", id.ToString());
        }
    }
    
    public async Task EnsureUserDoesNotExist(Guid id)
    {
        if (await userRepository.UserExistsAsync(id))
        {
            throw new UserNameAlreadyExists();
        }
    }
    
    public async Task EnsureExistsByUsernameHashAsync(string usernameHash)
    {
        if (!await userRepository.UserExistsByUsernameHashAsync(usernameHash))
        {
            throw new UserNotFound("usernameHash", usernameHash);
        }
    }
    
    public async Task EnsureDoesNotExistByUsernameHashAsync(string usernameHash)
    {
        if (await userRepository.UserExistsByUsernameHashAsync(usernameHash))
        {
            throw new UserNameAlreadyExists();
        }
    }
}