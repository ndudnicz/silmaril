namespace Api.Configuration;

public struct JwtConfiguration
{
    public string JwtValidIssuer { get; init; }
    public string JwtValidAudience { get; init; }
    public byte[] JwtSecretKey { get; init; }
}