using System.Security.Cryptography;
using System.Text;

namespace Api.Helpers;

public static class CryptoHelper
{
    public static string Sha512(string str)
    {
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(str));
        return BitConverter.ToString(hashBytes).Replace("-", "");
    }
    
    public static string GenerateRandomBase64Str(int length)
    {
        using var rng = RandomNumberGenerator.Create();
        var secretKey = new byte[length]; // 256 bits
        rng.GetBytes(secretKey);
        return Convert.ToBase64String(secretKey);
    }

    public static string Sha1(string str)
    {
        var hashBytes = SHA1.HashData(Encoding.UTF8.GetBytes(str));
        return BitConverter.ToString(hashBytes).Replace("-", "");
    }
}