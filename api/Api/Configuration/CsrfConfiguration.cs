namespace Api.Configuration;

public record CsrfConfiguration
{
    public required string HeaderName { get; init; }
    public required string CookieName { get; init; }
    public const string SessionCookieName = "aspnet.antiforgery";
}