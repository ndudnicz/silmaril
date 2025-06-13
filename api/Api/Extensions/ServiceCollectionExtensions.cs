using System.Text;
using Api.Repositories.EFContext;
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

        AddContext<LoginContext>();
        AddContext<UserContext>();
        AddContext<TagContext>();
        AddContext<LoginTagContext>();
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
    
    public static void AddJwtAuthentication(this IServiceCollection services, ConfigurationManager configuration, string jwtSecretKey)
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
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
                };
            });
    }
}