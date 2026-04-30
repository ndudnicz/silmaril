using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Exceptions;
using Api.Helpers;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;
using Moq;

namespace Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IUserValidator> _userValidator = new();
    private readonly Mock<IUserMapper> _userMapper = new();
    private readonly Mock<IVaultService> _vaultService = new();

    private UserService CreateService() => new UserService(
        _userRepository.Object,
        _userValidator.Object,
        _userMapper.Object,
        _vaultService.Object
    );

    private User CreateUserTest(
        Guid id = new(),
        string usernameHash = "defaultUsernameHash",
        string passwordHash = "defaultPasswordHash",
        byte[]? salt = null)
    {
        return new User
        {
            Id = id,
            UsernameHash = usernameHash,
            PasswordHash = passwordHash,
            Salt = salt ?? CryptoHelper.GenerateRandomByte(UserService.UserSaltLengthInBytes)
        };
    }

    private UserDto CreateUserDtoTest(User user)
    {
        return new UserDto(user.Salt)
        {
            Id = user.Id
        };
    }

    private CreateUserDto CreateCreateUserDtoTest(
        string username = "testUser",
        string password = "P@ssw0rd123")
    {
        return new CreateUserDto
        {
            Username = username,
            Password = password
        };
    }

    private UpdateUserDto CreateUpdateUserDtoTest(
        string username = "updatedUser")
    {
        return new UpdateUserDto
        {
            Username = username
        };
    }

    private VaultDto CreateVaultDtoTest(Guid id = new(), string name = "Default Vault")
    {
        return new VaultDto
        {
            Id = id,
            Name = name
        };
    }

    [Fact]
    private async Task GetAsync_ShouldReturnUserDto()
    {
        var user = CreateUserTest();
        var userDto = CreateUserDtoTest(user);

        _userRepository.Setup(r => r.GetAsync(user.Id)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        var result = await service.GetAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
    }


    [Fact]
    private async Task GetAsync_WhenUserNotFound_ShouldThrow()
    {
        var user = CreateUserTest();

        _userRepository.Setup(r => r.GetAsync(user.Id)).ReturnsAsync((User?)null);

        var service = CreateService();
        Func<Task> act = async () => await service.GetAsync(user.Id);

        await Assert.ThrowsAsync<UserNotFound>(act);
    }

    [Fact]
    private async Task GetByUserNameAsync_ShouldReturnUserDto()
    {
        var username = "testUser";
        var usernameHash = CryptoHelper.Sha512(username);
        var user = CreateUserTest(Guid.NewGuid(), usernameHash);
        var userDto = CreateUserDtoTest(user);

        _userRepository.Setup(r => r.GetByUserNameHashAsync(usernameHash)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        var result = await service.GetByUserNameAsync(username);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
    }

    [Fact]
    private async Task GetByUserNameAsync_WhenUserNotFound_ShouldThrow()
    {
        var username = "testUser";
        var usernameHash = CryptoHelper.Sha512(username);
        var user = CreateUserTest(Guid.NewGuid(), usernameHash);
        var userDto = CreateUserDtoTest(user);

        _userRepository.Setup(r => r.GetByUserNameHashAsync(username)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        Func<Task> act = async () => await service.GetByUserNameAsync(username);

        await Assert.ThrowsAsync<UserNotFound>(act);
    }

    [Fact]
    private async Task CreateAsync_ShouldReturnUserDto()
    {
        var createUserDto = CreateCreateUserDtoTest();
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(createUserDto.Username), CryptoHelper.Argon2idHash(createUserDto.Password));
        var userDto = CreateUserDtoTest(user);
        var defaultVault = CreateVaultDtoTest();

        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);
        _vaultService.Setup(v => v.CreateUserDefaultFirstVaultAsync(user.Id)).ReturnsAsync(defaultVault);

        var service = CreateService();

        var result = await service.CreateAsync(createUserDto);

        Assert.Equal(user.Id, result.Id);
    }

    [Fact]
    private async Task CreateAsync_WhenPasswordFormatInvalid_ShouldThrow()
    {
        var createUserDto = CreateCreateUserDtoTest("username", "invalidPassword");
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(createUserDto.Username), CryptoHelper.Argon2idHash(createUserDto.Password));

        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Throws<InvalidPasswordFormat>();

        var service = CreateService();

        Func<Task> act = async () => await service.CreateAsync(createUserDto);

        await Assert.ThrowsAsync<InvalidPasswordFormat>(act);
    }

    [Fact]
    private async Task UpdateAsync_ShouldReturnUpdatedUserDto()
    {
        var userId = Guid.NewGuid();
        var updateUserDto = CreateUpdateUserDtoTest("updatedUsername");
        var updatedUsernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("oldUsername"));
        var updatedUser = CreateUserTest(userId, updatedUsernameHash);
        var updatedUserDto = CreateUserDtoTest(updatedUser);

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(updatedUsernameHash)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetAsync(userId)).ReturnsAsync(existingUser);
        _userRepository.Setup(r => r.UpdateAsync(It.IsAny<User>())).ReturnsAsync(updatedUser);
        _userMapper.Setup(m => m.ToDto(updatedUser)).Returns(updatedUserDto);

        var service = CreateService();

        var result = await service.UpdateAsync(userId, updateUserDto);

        Assert.Equal(userId, result.Id);
    }

    [Fact]
    private async Task UpdateAsync_WhenUserNotFound_ShouldThrow()
    {
        var userId = Guid.NewGuid();

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Throws(new UserNotFound("id", userId.ToString()));

        var service = CreateService();

        Func<Task> act = async () => await service.UpdateAsync(userId, CreateUpdateUserDtoTest());

        await Assert.ThrowsAsync<UserNotFound>(act);
    }

    [Fact]
    private async Task UpdateAsync_WhenUsernameAlreadyExists_ShouldThrow()
    {
        var username = "existingUsername";
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(username));

        _userValidator.Setup(v => v.EnsureExistsAsync(user.Id)).Returns(Task.CompletedTask);
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Throws<UserNameAlreadyExists>();

        var service = CreateService();

        Func<Task> act = async () => await service.UpdateAsync(user.Id, CreateUpdateUserDtoTest("existingUsername"));

        await Assert.ThrowsAsync<UserNameAlreadyExists>(act);
    }

    [Fact]
    private async Task UpdatePasswordAsync_ShouldReturnUpdatedUserDto()
    {
        var userId = Guid.NewGuid();
        const string oldPassword = "OldP@ssw0rd123";
        const string newPassword = "NewP@ssw0rd123";
        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("testUser"), CryptoHelper.Argon2idHash(oldPassword));

        var updatedUser = CreateUserTest(userId, existingUser.UsernameHash, CryptoHelper.Argon2idHash(newPassword));
        var updatedUserDto = CreateUserDtoTest(updatedUser);

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetAsync(userId)).ReturnsAsync(existingUser);
        _userRepository.Setup(r => r.UpdateAsync(It.IsAny<User>())).ReturnsAsync(updatedUser);
        _userMapper.Setup(m => m.ToDto(updatedUser)).Returns(updatedUserDto);

        AuthService.EnsurePasswordIsValid(oldPassword, existingUser.PasswordHash);

        var service = CreateService();

        var result = await service.UpdatePasswordAsync(userId, new UpdateUserPasswordDto
        {
            OldPassword = oldPassword,
            NewPassword = newPassword
        });

        Assert.Equal(userId, result.Id);
    }

    [Fact]
    private async Task UpdatePasswordAsync_WhenPasswordInvalid_ShouldThrow()
    {
        var userId = Guid.NewGuid();
        var oldPassword = "OldP@ssw0rd123";

        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("testUser"), CryptoHelper.Argon2idHash(oldPassword));

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetAsync(userId)).ReturnsAsync(existingUser);

        var service = CreateService();

        Func<Task> act = async () => await service.UpdatePasswordAsync(userId, new UpdateUserPasswordDto
        {
            OldPassword = "WrongOldPassword",
            NewPassword = "NewP@ssw0rd123"
        });

        await Assert.ThrowsAsync<InvalidPassword>(act);
    }

    [Fact]
    private async Task UpdatePasswordAsync_WhenPasswordFormatInvalid_ShouldThrow()
    {
        var userId = Guid.NewGuid();
        var updateUserPasswordDto = new UpdateUserPasswordDto
        {
            OldPassword = "OldP@ssw0rd123",
            NewPassword = "invalidPassword"
        };
        var existingUser = CreateUserTest(userId,
            CryptoHelper.Sha512("testUser"),
            CryptoHelper.Argon2idHash(updateUserPasswordDto.OldPassword));

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetAsync(userId)).ReturnsAsync(existingUser);

        var service = CreateService();

        Func<Task> act = async () => await service.UpdatePasswordAsync(userId, updateUserPasswordDto);

        await Assert.ThrowsAsync<InvalidPasswordFormat>(act);
    }
}