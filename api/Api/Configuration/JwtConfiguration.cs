namespace Api.Configuration;

public record JwtConfiguration
{
    public required string JwtValidIssuer { get; init; }
    public required string JwtValidAudience { get; init; }
    public required byte[] JwtSecretKey { get; init; }
    public const string RefreshTokenCookieName = "refreshToken";
    public int RefreshTokenExpirationMinutes { get; init; }
    public int AccessTokenExpirationMinutes { get; init; }
}