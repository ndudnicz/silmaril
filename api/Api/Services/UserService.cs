using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Exceptions;
using Api.Helpers;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services;

public class UserService(
    IUserRepository userRepository,
    IUserValidator userValidator,
    IUserMapper userMapper,
    IVaultService vaultService
    ) : IUserService
{
    // The NIST recommends a 16-byte salt length for deriving the user's Master Password key using PBKDF2 on the frontend.
    public static readonly int UserSaltLengthInBytes = 16;

    public async Task<UserDto> GetAsync(Guid id)
    {
        var user = await userRepository.GetAsync(id);
        if (user == null)
        {
            throw new UserNotFound("id", id.ToString());
        }

        return userMapper.ToDto(user);
    }

    public async Task<UserDto> GetByUserNameAsync(string username)
    {
        var user = await userRepository.GetByUserNameHashAsync(CryptoHelper.Sha512(username));
        if (user == null)
        {
            throw new UserNotFound("username", username);
        }

        return userMapper.ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        var usernameHash = CryptoHelper.Sha512(createUserDto.Username);
        await userValidator.EnsureDoesNotExistByUsernameHashAsync(usernameHash);
        AuthService.EnsurePasswordFormatIsValid(createUserDto.Password);
        var userDto = userMapper.ToDto(await userRepository.CreateAsync(new User
        {
            UsernameHash = CryptoHelper.Sha512(createUserDto.Username),
            PasswordHash = CryptoHelper.Argon2idHash(createUserDto.Password),
            Salt = CryptoHelper.GenerateRandomByte(UserSaltLengthInBytes)
        }));
        await vaultService.CreateUserDefaultFirstVaultAsync(userDto.Id);
        return userDto;
    }

    public async Task<UserDto> UpdateAsync(Guid userId, UpdateUserDto updateUserDto)
    {
        await userValidator.EnsureExistsAsync(userId);
        var usernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        await userValidator.EnsureDoesNotExistByUsernameHashAsync(usernameHash);
        var existingUser = await userRepository.GetAsync(userId);
        existingUser!.UsernameHash = usernameHash;
        return userMapper.ToDto(await userRepository.UpdateAsync(existingUser));
    }

    public async Task<UserDto> UpdatePasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto)
    {
        await userValidator.EnsureExistsAsync(userId);
        AuthService.EnsurePasswordFormatIsValid(updateUserPasswordDto.NewPassword);
        var existingUser = await userRepository.GetAsync(userId);
        AuthService.EnsurePasswordIsValid(updateUserPasswordDto.OldPassword, existingUser!.PasswordHash);
        existingUser.PasswordHash = CryptoHelper.Argon2idHash(updateUserPasswordDto.NewPassword);
        return userMapper.ToDto(await userRepository.UpdateAsync(existingUser));
    }
}