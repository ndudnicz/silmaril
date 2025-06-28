using Api.Configuration;
using Api.Entities;
using Api.Entities.Dtos.Authentication;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories;
using Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;

public class AuthServiceTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly Mock<IAuthRepository> _authRepositoryMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _authRepositoryMock = new Mock<IAuthRepository>();
        _configurationMock = new Mock<IConfiguration>();
        
        _authService = new AuthService(
            _userServiceMock.Object,
            _authRepositoryMock.Object,
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
        // Arrange
        var password = "ValidPass1!";

        // Act
        var result = AuthService.ValidatePasswordFormat(password);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ValidatePasswordFormat_InvalidPassword_ReturnsFalse()
    {
        // Arrange
        var password = "invalid";

        // Act
        var result = AuthService.ValidatePasswordFormat(password);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task AuthAsync_ValidCredentials_ReturnsAuthResponseDto()
    {
        // Arrange
        var userName = "testUser";
        var authDto = new AuthDto { Username = userName, Password = "ValidPass1!" };
        var user = CreateTestUser(userName, authDto.Password);

        _userServiceMock.Setup(u => u.GetUserByUserNameAsync(It.IsAny<string>())).ReturnsAsync(user);

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

        _userServiceMock.Setup(u => u.GetUserByUserNameAsync(It.IsAny<string>())).ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _authService.AuthAsync(authDto);

        // Assert
        await act.Should().ThrowAsync<InvalidPassword>();
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
        _userServiceMock.Setup(u => u.GetUserAsync(user.Id)).ReturnsAsync(user);

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
