using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services;

public class UserService(
    IUserRepository userRepository,
    IUserValidator userValidator
    ): IUserService
{
    // The NIST recommends a 16-byte salt length for deriving the user's Master Password key using PBKDF2 on the frontend.
    private const int UserSaltLengthInBytes = 16;

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
        await userValidator.EnsureDoesNotExistByUsernameHashAsync(usernameHash);
        AuthService.EnsurePasswordFormatIsValid(createUserDto.Password);
        return await userRepository.CreateUserAsync(new User
        {
            UsernameHash = CryptoHelper.Sha512(createUserDto.Username),
            PasswordHash = CryptoHelper.Argon2idHash(createUserDto.Password),
            Salt = CryptoHelper.GenerateRandomByte(UserSaltLengthInBytes)
        });
    }
    
    public async Task<User> UpdateUserAsync(Guid userId, UpdateUserDto updateUserDto)
    {
        var usernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        await userValidator.EnsureDoesNotExistByUsernameHashAsync(usernameHash);
        var existingUser = await userRepository.GetUserAsync(userId);
        existingUser!.UsernameHash = usernameHash;
        return await userRepository.UpdateUserAsync(existingUser);
    }

    public async Task<User> UpdateUserPasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto)
    {
        await userValidator.EnsureExistsAsync(userId);
        var existingUser = await userRepository.GetUserAsync(userId);
        AuthService.EnsurePasswordFormatIsValid(updateUserPasswordDto.NewPassword);
        AuthService.EnsurePasswordIsValid(updateUserPasswordDto.OldPassword, existingUser!.UsernameHash);
        existingUser.PasswordHash = CryptoHelper.Argon2idHash(updateUserPasswordDto.NewPassword);
        return await userRepository.UpdateUserAsync(existingUser);
    }
}