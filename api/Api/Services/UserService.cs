using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories;
using Api.Services.Validation;

namespace Api.Services;

public class UserService(
    IUserRepository userRepository,
    IUserValidator userValidator
    ): IUserService
{
    public async Task<User> GetUserAsync(Guid id)
    {
        var user = await userRepository.GetUserAsync(id);
        if (user == null)
        {
            throw new UserNotFound("id", id.ToString());
        }

        return user;
    }
    
    public async Task<User> GetUserByUserNameAsync(string username)
    {
        var user = await userRepository.GetUserByUserNameAsync(CryptoHelper.Sha512(username));
        if (user == null)
        {
            throw new UserNotFound("username", username);
        }

        return user;
    }

    public async Task<User> CreateUserAsync(CreateUserDto createUserDto)
    {
        var usernameHash = CryptoHelper.Sha512(createUserDto.Username);
        await EnsureUserDoesNotExist(usernameHash);
        AuthService.ValidatePasswordFormat(createUserDto.Password);
        return await userRepository.CreateUserAsync(User.FromCreateUserDto(createUserDto));
    }
    
    public async Task<User> UpdateUserAsync(Guid userId, UpdateUserDto updateUserDto)
    {
        var usernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        await EnsureUserDoesNotExist(usernameHash);
        var existingUser = await userRepository.GetUserAsync(userId);
        existingUser!.UsernameHash = usernameHash;
        return await userRepository.UpdateUserAsync(existingUser);
    }
    
    private async Task EnsureUserDoesNotExist(string usernameHash)
    {
        if (await userRepository.UserExistsByUsernameHashAsync(usernameHash))
        {
            throw new UserNameAlreadyExists();
        }
    }

    public async Task<User> UpdateUserPasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto)
    {
        await userValidator.EnsureExistsAsync(userId);
        var existingUser = await userRepository.GetUserAsync(userId);
        AuthService.VerifyPasswordHash(updateUserPasswordDto.OldPassword, existingUser!.UsernameHash);
        AuthService.ValidatePasswordFormat(updateUserPasswordDto.NewPassword);
        existingUser.PasswordHash = CryptoHelper.Argon2idHash(updateUserPasswordDto.NewPassword);
        return await userRepository.UpdateUserAsync(existingUser);
    }
}