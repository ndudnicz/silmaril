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
        if (AuthService.ValidatePasswordFormat(createUserDto.Password) == false)
        {
            throw new InvalidPasswordFormat();
        }
        return await userRepository.CreateUserAsync(User.FromCreateUserDto(createUserDto));
    }
    
    public async Task<User> UpdateUserAsync(UpdateUserDto updateUserDto)
    {
        var existingUser = await userRepository.GetUserAsync(updateUserDto.Id);
        existingUser.Username = updateUserDto.Username;
        return await userRepository.UpdateUserAsync(existingUser);
    }

    public async Task<User> UpdateUserPasswordAsync(UpdateUserPasswordDto updateUserPasswordDto)
    {
        var existingUser = await userRepository.GetUserAsync(updateUserPasswordDto.Id);
        if (existingUser.PasswordHash != CryptoHelper.Sha512(updateUserPasswordDto.OldPassword))
        {
            throw new InvalidPassword();
        }

        if (AuthService.ValidatePasswordFormat(updateUserPasswordDto.NewPassword) == false)
        {
            throw new InvalidPasswordFormat();
        }
        existingUser.PasswordHash = CryptoHelper.Sha512(updateUserPasswordDto.NewPassword);
        return await userRepository.UpdateUserAsync(existingUser);
    }
}