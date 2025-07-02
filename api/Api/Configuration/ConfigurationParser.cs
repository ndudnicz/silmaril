using Api.Helpers;

namespace Api.Configuration;

public static class ConfigurationParser
{
    public static (JwtConfiguration, MySqlConfiguration, CsrfConfiguration) Parse(ConfigurationManager configuration)
    {
        var jwtSecretKeyBae64 = configuration["Jwt:SecretKeyBase64"];
        if (string.IsNullOrEmpty(jwtSecretKeyBae64))
        {
            throw new InvalidOperationException("The environment variable 'Jwt:SecretKeyBase64' is not defined. ");
        }
        if (jwtSecretKeyBae64 is "6a5PsnpMFNt6lu0VtNwWoPniQNecHT4rL5W3PXm8mfw=")
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(@"
========================================================================================================================
  ⚠️ WARNING: THE ENVIRONMENT VARIABLE 'Jwt__SecretKeyBase64' IS NOT DEFINED!
------------------------------------------------------------------------------------------------------------------------
  The application is using a default fallback value (insecure).
  This SHOULD NOT happen in production.
  ➤ Recommended Action:
    - You can use the CryptoHelper.GenerateRandomBase64Str(32) method available in this project to generate a secure key
    - Set the Jwt__SecretKeyBase64 environment variable before launching the API
    - Example: export Jwt__SecretKeyBase64=""your_secret_key_base_64_string""
  🚨 RISK OF SECURITY BREACH IF YOU CONTINUE WITHOUT THIS! 🚨
========================================================================================================================
");
            Console.ResetColor();
        }
        var mysqlConfiguration = new MySqlConfiguration
        {
            ConnectionString = configuration["ConnectionStrings:MySql"] ??
                               throw new InvalidOperationException("MySql:ConnectionString is not defined in the configuration.")
        };
        var jwtSecretKey = CryptoHelper.DecodeBase64(jwtSecretKeyBae64!);
        var accessTokenExpirationMinutes = int.Parse(configuration["Jwt:AccessTokenExpirationMinutes"]);
        var refreshTokenExpirationMinutes = int.Parse(configuration["Jwt:RefreshTokenExpirationMinutes"]);
        var jwtConfiguration = new JwtConfiguration
        {
            JwtSecretKey = jwtSecretKey,
            JwtValidIssuer = configuration["Jwt:ValidIssuer"] ??
                             throw new InvalidOperationException("Jwt:ValidIssuer is not defined in the configuration."),
            JwtValidAudience = configuration["Jwt:ValidAudience"] ??
                               throw new InvalidOperationException("Jwt:ValidAudience is not defined in the configuration."),
            AccessTokenExpirationMinutes = accessTokenExpirationMinutes,
            RefreshTokenExpirationMinutes = refreshTokenExpirationMinutes
        };
        var csrfConfiguration = new CsrfConfiguration
        {
            CookieName = configuration["Csrf:CookieName"] ?? throw new InvalidOperationException("Csrf:CookieName is not defined in the configuration."),
            HeaderName = configuration["Csrf:HeaderName"] ?? throw new InvalidOperationException("Csrf:HeaderName is not defined in the configuration."),
        };
        return (jwtConfiguration, mysqlConfiguration, csrfConfiguration);
    }
}