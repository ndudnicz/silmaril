using Api.Repositories;
using Api.Repositories.EFContext;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddContexts(this IServiceCollection services, ConfigurationManager configuration)
    {
        const int retryCount = 5;
        const int retryDelaySeconds = 30;

        AddContext<AppDbContext>();
        return;

        void AddContext<T>() where T : DbContext{
            services.AddDbContextPool<T>(options =>
            {
                options.UseMySql(
                    configuration["ConnectionString"],
                    ServerVersion.AutoDetect(configuration["ConnectionString"]),
                    opt => opt.EnableRetryOnFailure(
                        maxRetryCount: retryCount,
                        maxRetryDelay: System.TimeSpan.FromSeconds(retryDelaySeconds),
                        errorNumbersToAdd: null)
                );
            });
        }
    }
    
    public static void AddJwtAuthentication(this IServiceCollection services, ConfigurationManager configuration, byte[] jwtSecretKey)
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
                    ValidIssuer = configuration["Jwt:ValidIssuer"],
                    ValidAudience = configuration["Jwt:ValidAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(jwtSecretKey)
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
    
    public static void AddServices(this IServiceCollection services, ConfigurationManager configuration, byte[] jwtSecretKey)
    {
        services.AddScoped<IAuthService>(s => new AuthService(
            s.GetService<IUserService>()!,
            s.GetService<IAuthRepository>()!,
            configuration,
            jwtSecretKey));
        services.AddScoped<ILoginService, LoginService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITagService, TagService>();
    }
}