using System.Security.Cryptography;
using System.Text;
using Isopoh.Cryptography.Argon2;

namespace Api.Helpers;

public static class CryptoHelper
{
    public static string Sha512(string str)
    {
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(str));
        return BitConverter.ToString(hashBytes).Replace("-", "");
    }
    
    public static string Argon2idHash(string password)
    {
        var config = new Argon2Config
        {
            Type = Argon2Type.HybridAddressing,
            Version = Argon2Version.Nineteen,
            TimeCost = 4,
            MemoryCost = 1 << 16,
            Lanes = 4,
            Threads = Environment.ProcessorCount,
            Password = System.Text.Encoding.UTF8.GetBytes(password),
            Salt = GenerateRandomByte(16),
            HashLength = 32
        };

        var hash = Argon2.Hash(config);
        return hash;
    }
    
    public static bool Argon2idVerify(string password, string hash) =>
        Argon2.Verify(hash, password);

    public static byte[] GenerateRandomByte(int length)
    {
        var randomBytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return randomBytes;
    }

    public static string GenerateRandomBase64Str(int length) =>
        Convert.ToBase64String(GenerateRandomByte(length));
    
    public static byte[] DecodeBase64(string? base64) =>
        string.IsNullOrWhiteSpace(base64) ? [] : Convert.FromBase64String(base64);
    
    public static Guid GenerateSecureGuid() => new(GenerateRandomByte(16));
}