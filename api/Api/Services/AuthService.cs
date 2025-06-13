using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Entities;
using Api.Entities.Dtos;
using Api.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using Api.Helpers;

namespace Api.Services;

public class AuthService(IUserRepository userRepository, ConfigurationManager configuration, string jwtSecretKey): IAuthService
{
    public async Task<string?> AuthAsync(AuthDto authDto)
    {
        var user = await userRepository.GetUserByUserNameAsync(authDto.Username);
        if (user == null)
        {
            return null;
        }

        if (user.Password != CryptoHelper.HashPassword(authDto.Password))
        {
            return null;
        }
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(jwtSecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, CryptoHelper.GetClaimHashName(user.Username))
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = configuration["Jwt:ValidIssuer"], // Optional: Set your issuer
            Audience = configuration["Jwt:ValidAudience"] // Optional: Set your audience
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);
        return jwt;
    }
}