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
using FluentAssertions;
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
    
    private UserDto CreateUserDtoTest(
        Guid id,
        byte[] salt)
    {
        return new UserDto(salt)
        {
            Id = id,
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
    private async Task GetUserAsync_ShouldReturnUserDto()
    {
        var user = CreateUserTest();
        var userDto = CreateUserDtoTest(user);
        
        _userRepository.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        var result = await service.GetUserAsync(user.Id);

        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
    }
    
    
    [Fact]
    private async Task GetUserAsync_WhenUserNotFound_ShouldThrow()
    {
        var user = CreateUserTest();
        
        _userRepository.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync((User?)null);

        var service = CreateService();
        Func<Task> act = async () => await service.GetUserAsync(user.Id);

        await act.Should().ThrowAsync<UserNotFound>();
    }
    
    [Fact]
    private async Task GetUserByUsernameAsync_ShouldReturnUserDto()
    {
        var username = "testUser";
        var usernameHash = CryptoHelper.Sha512(username);
        var user = CreateUserTest(Guid.NewGuid(), usernameHash);
        var userDto = CreateUserDtoTest(user);
        
        _userRepository.Setup(r => r.GetUserByUserNameHashAsync(usernameHash)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        var result = await service.GetUserByUserNameAsync(username);

        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
    }
    
    [Fact]
    private async Task GetUserByUsernameAsync_WhenUserNotFound_ShouldThrow()
    {
        var username = "testUser";
        var usernameHash = CryptoHelper.Sha512(username);
        var user = CreateUserTest(Guid.NewGuid(), usernameHash);
        var userDto = CreateUserDtoTest(user);
        
        _userRepository.Setup(r => r.GetUserByUserNameHashAsync(username)).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);

        var service = CreateService();
        Func<Task> act = async () => await service.GetUserByUserNameAsync(username);

        await act.Should().ThrowAsync<UserNotFound>();
    }

    [Fact]
    private async Task CreateUserAsync_ShouldReturnUserDto()
    {
        var createUserDto = CreateCreateUserDtoTest();
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(createUserDto.Username), CryptoHelper.Argon2idHash(createUserDto.Password));
        var userDto = CreateUserDtoTest(user);
        var defaultVault = CreateVaultDtoTest();
        
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync(user);
        _userMapper.Setup(m => m.ToDto(user)).Returns(userDto);
        _vaultService.Setup(v => v.CreateUserDefaultFirstVaultAsync(user.Id)).ReturnsAsync(defaultVault);
        
        var service = CreateService();

        var result = await service.CreateUserAsync(createUserDto);
        
        result.Id.Should().Be(user.Id);
    }
    
    [Fact]
    private async Task CreateUserAsync_WhenPasswordFormatInvalid_ShouldThrow()
    {
        var createUserDto = CreateCreateUserDtoTest("username", "invalidPassword");
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(createUserDto.Username), CryptoHelper.Argon2idHash(createUserDto.Password));
        
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Throws<InvalidPasswordFormat>();
        
        var service = CreateService();

        Func<Task> act = async () => await service.CreateUserAsync(createUserDto);

        await act.Should().ThrowAsync<InvalidPasswordFormat>();
    }
    
    [Fact]
    private async Task UpdateUserAsync_ShouldReturnUpdatedUserDto()
    {
        var userId = Guid.NewGuid();
        var updateUserDto = CreateUpdateUserDtoTest("updatedUsername");
        var updatedUsernameHash = CryptoHelper.Sha512(updateUserDto.Username);
        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("oldUsername"));
        var updatedUser = CreateUserTest(userId, updatedUsernameHash);
        var updatedUserDto = CreateUserDtoTest(updatedUser);
        
        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(updatedUsernameHash)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetUserAsync(userId)).ReturnsAsync(existingUser);
        _userRepository.Setup(r => r.UpdateUserAsync(It.IsAny<User>())).ReturnsAsync(updatedUser);
        _userMapper.Setup(m => m.ToDto(updatedUser)).Returns(updatedUserDto);

        var service = CreateService();
        
        var result = await service.UpdateUserAsync(userId, updateUserDto);
        
        result.Id.Should().Be(userId);
    }

    [Fact]
    private async Task UpdateUserAsync_WhenUserNotFound_ShouldThrow()
    {
        var userId = Guid.NewGuid();
        
        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Throws(new UserNotFound("id", userId.ToString()));

        var service = CreateService();
        
        Func<Task> act = async () => await service.UpdateUserAsync(userId, CreateUpdateUserDtoTest());
        
        await act.Should().ThrowAsync<UserNotFound>();
    }

    [Fact]
    private async Task UpdateUserAsync_WhenUsernameAlreadyExists_ShouldThrow()
    {
        var username = "existingUsername";
        var user = CreateUserTest(Guid.NewGuid(), CryptoHelper.Sha512(username));
        
        _userValidator.Setup(v => v.EnsureExistsAsync(user.Id)).Returns(Task.CompletedTask);
        _userValidator.Setup(v => v.EnsureDoesNotExistByUsernameHashAsync(user.UsernameHash)).Throws<UserNameAlreadyExists>();
        
        var service = CreateService();
        
        Func<Task> act = async () => await service.UpdateUserAsync(user.Id, CreateUpdateUserDtoTest("existingUsername"));
        
        await act.Should().ThrowAsync<UserNameAlreadyExists>();
    }
    
    [Fact]
    private async Task UpdateUserPasswordAsync_ShouldReturnUpdatedUserDto()
    {
        var userId = Guid.NewGuid();
        var oldPassword = "OldP@ssw0rd123";
        var newPassword = "NewP@ssw0rd123";
        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("testUser"), CryptoHelper.Argon2idHash(oldPassword));
        var updateUserPasswordDto = new UpdateUserPasswordDto
        {
            OldPassword = oldPassword,
            NewPassword = newPassword
        };
        var updatedUser = CreateUserTest(userId, existingUser.UsernameHash, CryptoHelper.Argon2idHash(newPassword));
        var updatedUserDto = CreateUserDtoTest(updatedUser);
        
        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetUserAsync(userId)).ReturnsAsync(existingUser);
        _userRepository.Setup(r => r.UpdateUserAsync(It.IsAny<User>())).ReturnsAsync(updatedUser);
        _userMapper.Setup(m => m.ToDto(updatedUser)).Returns(updatedUserDto);

        AuthService.EnsurePasswordIsValid(oldPassword, existingUser.PasswordHash);
        
        var service = CreateService();
        
        var result = await service.UpdateUserPasswordAsync(userId, new UpdateUserPasswordDto
        {
            OldPassword = oldPassword,
            NewPassword = newPassword
        });
        
        result.Id.Should().Be(userId);
    }

    [Fact]
    private async Task UpdateUserPasswordAsync_WhenPasswordInvalid_ShouldThrow()
    {
        var userId = Guid.NewGuid();
        var oldPassword = "OldP@ssw0rd123";
        
        var existingUser = CreateUserTest(userId, CryptoHelper.Sha512("testUser"), CryptoHelper.Argon2idHash(oldPassword));

        _userValidator.Setup(v => v.EnsureExistsAsync(userId)).Returns(Task.CompletedTask);
        _userRepository.Setup(r => r.GetUserAsync(userId)).ReturnsAsync(existingUser);
        
        var service = CreateService();
        
        Func<Task> act = async () => await service.UpdateUserPasswordAsync(userId, new UpdateUserPasswordDto
        {
            OldPassword = "WrongOldPassword",
            NewPassword = "NewP@ssw0rd123"
        });
        
        await act.Should().ThrowAsync<InvalidPassword>();
    }
    
    [Fact]
    private async Task UpdateUserPasswordAsync_WhenPasswordFormatInvalid_ShouldThrow()
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
        _userRepository.Setup(r => r.GetUserAsync(userId)).ReturnsAsync(existingUser);
        
        var service = CreateService();
        
        Func<Task> act = async () => await service.UpdateUserPasswordAsync(userId, updateUserPasswordDto);
        
        await act.Should().ThrowAsync<InvalidPasswordFormat>();
    }
}