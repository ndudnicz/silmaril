using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Entities;
using Api.Entities.Dtos.Authentication;
using Api.Exceptions;
using Api.Helpers;
using Api.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services;

public class AuthService(
    IUserService userService,
    IAuthRepository authRepository,
    ConfigurationManager configuration,
    string jwtSecretKey
    ): IAuthService
{
    private readonly int _jwtTokenExpirationTimeInMinutes = 20; // Set JWT token expiration to 20 minutes
    private readonly int _jwtRefreshTokenExpirationTimeInHours = 1; // Set refresh token expiration to 1 hour
    
    public static bool ValidatePasswordFormat(string password)
    {
        // Password must be at least 8 characters long, contain at least one letter, one digit,
        // one uppercase letter and one lowercase letter and contains at least one special character.
        const string specialCharacters = "!@#$%^&*()-_=+[]{}|;:',.<>?/";
        return !string.IsNullOrEmpty(password)
               && password.Length >= 8
               && password.Any(char.IsDigit)
               && password.Any(char.IsLetter)
               && password.Any(char.IsLower)
               && password.Any(char.IsUpper)
               && password.Any(c => specialCharacters.Contains(c));
    }
    
    public async Task<AuthResponseDto> AuthAsync(AuthDto authDto)
    {
        try
        {
            var user = await userService.GetUserByUserNameAsync(authDto.Username);
            if (user!.PasswordHash != CryptoHelper.Sha512(authDto.Password))
            {
                throw new InvalidPassword();
            }
            var jwt = GenerateJwtToken(user.Id);
            var (refreshTokenStr, refreshToken) = GenerateRefreshToken(user.Id);
            await authRepository.UpsertAsync(refreshToken);
            return new AuthResponseDto
            {
                JwtToken = jwt,
                RefreshToken = refreshTokenStr
            };
        }
        catch
        {
            throw;
        }
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        var refreshTokenHash = CryptoHelper.Sha512(refreshToken);
        var existingRefreshToken = await authRepository.GetAsync(refreshTokenHash);
        if (existingRefreshToken == null)
        {
            throw new InvalidRefreshToken();
        }
        if (existingRefreshToken.Expires < DateTime.UtcNow)
        {
            throw new ExpiredRefreshToken();
        }

        try
        {
            var user = await userService.GetUserAsync(existingRefreshToken.UserId);
            var jwt = GenerateJwtToken(user.Id);
            var (newRefreshTokenStr, newRefreshToken) = GenerateRefreshToken(user.Id);
            await authRepository.UpsertAsync(newRefreshToken);
            return new AuthResponseDto
            {
                JwtToken = jwt,
                RefreshToken = newRefreshTokenStr
            };
        }
        catch
        {
            throw;
        }
    }

    private string GenerateJwtToken(Guid userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(jwtSecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, userId.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(_jwtTokenExpirationTimeInMinutes),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = configuration["Jwt:ValidIssuer"],
            Audience = configuration["Jwt:ValidAudience"]
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);
        return jwt;
    }
    
    private (string, RefreshToken) GenerateRefreshToken(Guid userId)
    {
        var refreshTokenStr = CryptoHelper.GenerateRandomBase64Str(256);
        var refreshTokenHash = CryptoHelper.Sha512(refreshTokenStr);
        return (refreshTokenStr, new RefreshToken
        {
            UserId = userId,
            TokenHash = refreshTokenHash,
            Expires = DateTime.UtcNow.AddHours(_jwtRefreshTokenExpirationTimeInHours)
        });
    }
}