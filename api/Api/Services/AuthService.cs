using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Authentication;
using Api.Helpers;
using Api.Repositories;
using Api.Services.Exceptions;
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
    
    public async Task<AuthResponseDto> AuthAsync(AuthDto authDto)
    {
        try
        {
            var user = await userService.GetUserByUserNameAsync(authDto.Username);
            if (user!.PasswordHash != CryptoHelper.Sha512(authDto.Password))
            {
                throw new InvalidPassword();
            }
            var jwt = GenerateJwtToken(user.Username);
            var (refreshTokenStr, refreshToken) = GenerateRefreshToken(user.Id);
            await authRepository.UpsertAsync(refreshToken);
            return new AuthResponseDto
            {
                JwtToken = GenerateJwtToken(user.Username),
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
            var jwt = GenerateJwtToken(user.Username);
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

    private string GenerateJwtToken(string userName)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(jwtSecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, CryptoHelper.Sha1(userName))
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
    
    private (string, RefreshToken) GenerateRefreshToken(int userId)
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