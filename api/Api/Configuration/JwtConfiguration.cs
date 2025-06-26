namespace Api.Configuration;

public record JwtConfiguration
{
    public string JwtValidIssuer { get; init; }
    public string JwtValidAudience { get; init; }
    public byte[] JwtSecretKey { get; init; }
    public string RefreshTokenCookieName { get; } = "refreshToken";
    public int RefreshTokenExpirationHours { get; init; }
    public int AccessTokenExpirationMinutes { get; init; }
}