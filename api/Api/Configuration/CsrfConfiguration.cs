namespace Api.Configuration;

public record CsrfConfiguration
{
    public string HeaderName { get; init; }
    public string CookieName { get; init; }
    public string SessionCookieName { get; init; } = "aspnet.antiforgery";
}