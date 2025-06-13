using System.Security.Cryptography;
using System.Text;

namespace Api.Helpers;

public static class CryptoHelper
{
    public static string HashPassword(string password)
    {
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(password));
        return BitConverter.ToString(hashBytes).Replace("-", "");
    }
    
    public static string GenerateJwtSecretKey()
    {
        using var rng = RandomNumberGenerator.Create();
        var secretKey = new byte[32]; // 256 bits
        rng.GetBytes(secretKey);
        return Convert.ToBase64String(secretKey);
    }

    public static string GetClaimHashName(string name)
    {
        var hashBytes = SHA1.HashData(Encoding.UTF8.GetBytes(name));
        return BitConverter.ToString(hashBytes).Replace("-", "");
    }
}