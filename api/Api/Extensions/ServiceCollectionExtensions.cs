using Api.Configuration;
using Api.Repositories;
using Api.Repositories.EFContext;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddContexts(this IServiceCollection services, MySqlConfiguration mySqlConfiguration)
    {
        const int retryCount = 5;
        const int retryDelaySeconds = 30;

        AddContext<AppDbContext>();
        return;

        void AddContext<T>() where T : DbContext{
            services.AddDbContextPool<T>(options =>
            {
                options.UseMySql(
                    mySqlConfiguration.ConnectionString,
                    ServerVersion.AutoDetect(mySqlConfiguration.ConnectionString),
                    opt => opt.EnableRetryOnFailure(
                        maxRetryCount: retryCount,
                        maxRetryDelay: System.TimeSpan.FromSeconds(retryDelaySeconds),
                        errorNumbersToAdd: null)
                );
            });
        }
    }
    
    public static void AddJwtAuthentication(this IServiceCollection services, JwtConfiguration jwtConfiguration)
    { 
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtConfiguration.JwtValidIssuer,
                    ValidAudience = jwtConfiguration.JwtValidAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(jwtConfiguration.JwtSecretKey)
                };
            });
    }

    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<ILoginRepository, LoginRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<IAuthRepository, AuthRepository>();
    }
    
    public static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ILoginService, LoginService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITagService, TagService>();
    }

    public static void AddCsrf(this IServiceCollection services, CsrfConfiguration csrfConfiguration)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = csrfConfiguration.HeaderName;
            options.Cookie.Name = csrfConfiguration.SessionCookieName;
        });
    }
}