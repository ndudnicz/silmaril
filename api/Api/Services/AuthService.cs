using System.IdentityModel.Tokens.Jwt;
using System.Runtime.InteropServices.JavaScript;
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
    byte[] jwtSecretKey
    ): IAuthService
{
    private readonly int _jwtTokenExpirationTimeInMinutes = 20; // Set JWT token expiration to 20 minutes
    private readonly int _jwtRefreshTokenExpirationTimeInHours = 1; // Set refresh token expiration to 1 hour
    
    public static bool ValidatePasswordFormat(string password)
    {
        // The password must be at least 8 characters long, contain at least one letter, one digit,
        // one uppercase letter, one lowercase letter and contains at least one special character.
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
        var user = await userService.GetUserByUserNameAsync(CryptoHelper.Sha512(authDto.Username));
        if (!CryptoHelper.Argon2idVerify(authDto.Password, user!.PasswordHash))
        {
            throw new InvalidPassword();
        }
        var jwt = GenerateJwtToken(user.Id);
        var (refreshTokenStr, refreshToken, refreshTokenExpiration) = GenerateRefreshToken(user.Id);
        await authRepository.UpsertAsync(refreshToken);
        return new AuthResponseDto
        {
            JwtToken = jwt,
            RefreshToken = refreshTokenStr,
            RefreshTokenExpiration = refreshTokenExpiration
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var refreshTokenHash = CryptoHelper.Sha512(refreshToken);
        var existingRefreshToken = await authRepository.GetAsync(refreshTokenHash);
        if (existingRefreshToken == null)
        {
            throw new UnknownRefreshToken();
        }
        try
        {
            ValidateRefreshToken(refreshToken);
        }
        catch (InvalidRefreshToken ex)
        {
            throw new InvalidRefreshToken();
        }
        
        var user = await userService.GetUserAsync(existingRefreshToken.UserId);
        var jwt = GenerateJwtToken(user.Id);
        var (newRefreshTokenStr, newRefreshToken, refreshTokenExpiration) = GenerateRefreshToken(user.Id);
        await authRepository.UpsertAsync(newRefreshToken);
        return new AuthResponseDto
        {
            JwtToken = jwt,
            RefreshToken = newRefreshTokenStr,
            RefreshTokenExpiration = refreshTokenExpiration
        };
    }
    
    public async Task<int> RevokeRefreshTokenAsync(string refreshToken)
    {
        var refreshTokenHash = CryptoHelper.Sha512(refreshToken);
        return await authRepository.DeleteRefreshTokenAsync(refreshTokenHash);
    }

    private string GenerateJwtToken(Guid userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, userId.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(_jwtTokenExpirationTimeInMinutes),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(jwtSecretKey),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = configuration["Jwt:ValidIssuer"],
            Audience = configuration["Jwt:ValidAudience"]
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);
        return jwt;
    }
    
    private (string, RefreshToken, DateTime) GenerateRefreshToken(Guid userId)
    {
        var refreshTokenStr = CryptoHelper.GenerateRandomBase64Str(256);
        var refreshTokenHash = CryptoHelper.Sha512(refreshTokenStr);
        var refreshTokenExpiration = DateTime.UtcNow.AddHours(_jwtRefreshTokenExpirationTimeInHours);
        return (refreshTokenStr, new RefreshToken
        {
            UserId = userId,
            TokenHash = refreshTokenHash,
            Expires = refreshTokenExpiration
        }, refreshTokenExpiration);
    }
    
    private ClaimsPrincipal? ValidateRefreshToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtSecretKey),
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParams, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }
}