using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories;

namespace Api.Services;

public class UserService(
    IUserRepository userRepository
    ): IUserService
{
    public async Task<User> GetUserAsync(Guid id)
    {
        return await userRepository.GetUserAsync(id);
    }
    
    public async Task<User> GetUserByUserNameAsync(string username)
    {
        return await userRepository.GetUserByUserNameAsync(username);
    }

    public async Task<User> CreateUserAsync(CreateUserDto createUserDto)
    {
        if (await userRepository.UserExistsAsync(CryptoHelper.Sha512(createUserDto.Username)))
        {
            throw new UserNameAlreadyExists();
        }
        if (AuthService.ValidatePasswordFormat(createUserDto.Password) == false)
        {
            throw new InvalidPasswordFormat();
        }
        return await userRepository.CreateUserAsync(User.FromCreateUserDto(createUserDto));
    }
    
    public async Task<User> UpdateUserAsync(Guid userId, UpdateUserDto updateUserDto)
    {
        if (await userRepository.UserExistsAsync(CryptoHelper.Sha512(updateUserDto.Username)))
        {
            throw new UserNameAlreadyExists();
        }
        var existingUser = await userRepository.GetUserAsync(userId);
        existingUser.UsernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        return await userRepository.UpdateUserAsync(existingUser);
    }

    public async Task<User> UpdateUserPasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto)
    {
        var existingUser = await userRepository.GetUserAsync(userId);
        if (!CryptoHelper.Argon2idVerify(updateUserPasswordDto.OldPassword, existingUser.PasswordHash))
        {
            throw new InvalidPassword();
        }

        if (AuthService.ValidatePasswordFormat(updateUserPasswordDto.NewPassword) == false)
        {
            throw new InvalidPasswordFormat();
        }
        existingUser.PasswordHash = CryptoHelper.Argon2idHash(updateUserPasswordDto.NewPassword);
        return await userRepository.UpdateUserAsync(existingUser);
    }
}