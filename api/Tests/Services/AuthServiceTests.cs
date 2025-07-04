using Api.Configuration;
using Api.Entities;
using Api.Entities.Dtos.Authentication;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Validation.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IAuthRepository> _authRepositoryMock;
    private readonly Mock<IUserValidator> _userValidatorMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _authRepositoryMock = new Mock<IAuthRepository>();
        _userValidatorMock = new Mock<IUserValidator>();
        
        _authService = new AuthService(
            _userRepositoryMock.Object,
            _authRepositoryMock.Object,
            _userValidatorMock.Object,
            new JwtConfiguration
            {
                JwtValidIssuer = "TestIssuer",
                JwtValidAudience = "TestAudience",
                JwtSecretKey = CryptoHelper.GenerateRandomByte(32),
                AccessTokenExpirationMinutes = 15,
                RefreshTokenExpirationMinutes = 1
            }
        );
    }
    
    private static User CreateTestUser(string username = "testUser", string password = "password", Guid userId = new())
    {
        return new User
        {
            Id = userId,
            UsernameHash = CryptoHelper.Sha512(username),
            PasswordHash = CryptoHelper.Argon2idHash(password),
            Salt = CryptoHelper.GenerateRandomByte(16) // 128 bits
        };
    }

    [Fact]
    public void ValidatePasswordFormat_ValidPassword_ReturnsTrue()
    {
        var password = "ValidPass1!";

        var act = () => AuthService.EnsurePasswordFormatIsValid(password);

        act.Should().NotThrow();
    }

    [Fact]
    public void ValidatePasswordFormat_InvalidPassword_ShouldThrow()
    {
        var password = "invalid";
        
        var act = () => AuthService.EnsurePasswordFormatIsValid(password);
        
        act.Should().Throw<InvalidPasswordFormat>();
    }

    [Fact]
    public async Task AuthAsync_ValidCredentials_ReturnsAuthResponseDto()
    {
        // Arrange
        var userName = "testUser";
        var authDto = new AuthDto { Username = userName, Password = "ValidPass1!" };
        var user = CreateTestUser(userName, authDto.Password);

        _userRepositoryMock.Setup(u => u.GetUserByUserNameAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userValidatorMock.Setup(u => u.EnsureExistsByUsernameHashAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _authService.AuthAsync(authDto);

        // Assert
        result.Should().NotBeNull();
        result.JwtToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.RefreshTokenExpiration.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task AuthAsync_InvalidPassword_ThrowsInvalidPassword()
    {
        // Arrange
        var userName = "testUser";
        var authDto = new AuthDto { Username = userName, Password = "InvalidPass" };
        var user = CreateTestUser(userName, "validPassword");

        _userRepositoryMock.Setup(u => u.GetUserByUserNameAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userValidatorMock.Setup(u => u.EnsureExistsByUsernameHashAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        Func<Task> act = async () => await _authService.AuthAsync(authDto);

        // Assert
        await act.Should().ThrowAsync<InvalidPassword>();
    }
    
    [Fact]
    public async Task AuthAsync_InvalidUsername_ThrowsUserNotFound()
    {
        // Arrange
        var userName = "testUser";
        var authDto = new AuthDto { Username = userName, Password = "validPassword" };
        var user = CreateTestUser(userName, "validPassword");

        _userRepositoryMock.Setup(u => u.GetUserByUserNameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _userValidatorMock.Setup(u => u.EnsureExistsByUsernameHashAsync(It.IsAny<string>()))
            .Throws(new UserNotFound("username", userName));

        // Act
        Func<Task> act = async () => await _authService.AuthAsync(authDto);

        // Assert
        await act.Should().ThrowAsync<UserNotFound>();
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidRefreshToken_ReturnsAuthResponseDto()
    {
        // Arrange
        var user = CreateTestUser();
        var refreshToken = "validRefreshToken";
        var refreshTokenHash = CryptoHelper.Sha512(refreshToken);
        var existingRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            Expires = DateTime.UtcNow.AddHours(1)
        };

        _authRepositoryMock.Setup(a => a.GetAsync(refreshTokenHash)).ReturnsAsync(existingRefreshToken);
        _userRepositoryMock.Setup(u => u.GetUserAsync(user.Id)).ReturnsAsync(user);
        _userRepositoryMock.Setup(u => u.UserExistsAsync(user.Id)).ReturnsAsync(true);
        _userValidatorMock.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _authService.RefreshTokenAsync(refreshToken);

        // Assert
        result.Should().NotBeNull();
        result.JwtToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.RefreshTokenExpiration.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task RefreshTokenAsync_UnknownRefreshToken_ThrowsUnknownRefreshToken()
    {
        // Arrange
        var refreshToken = "unknownRefreshToken";

        _authRepositoryMock.Setup(a => a.GetAsync(It.IsAny<string>())).ReturnsAsync((RefreshToken)null);

        // Act
        Func<Task> act = async () => await _authService.RefreshTokenAsync(refreshToken);

        // Assert
        await act.Should().ThrowAsync<UnknownRefreshToken>();
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredRefreshToken_ThrowsExpiredRefreshToken()
    {
        // Arrange
        var user = CreateTestUser();
        var refreshToken = "expiredRefreshToken";
        var refreshTokenHash = CryptoHelper.Sha512(refreshToken);
        var existingRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            Expires = DateTime.UtcNow.AddHours(-1)
        };

        _authRepositoryMock.Setup(a => a.GetAsync(refreshTokenHash)).ReturnsAsync(existingRefreshToken);

        // Act
        Func<Task> act = async () => await _authService.RefreshTokenAsync(refreshToken);

        // Assert
        await act.Should().ThrowAsync<ExpiredRefreshToken>();
    }
}
