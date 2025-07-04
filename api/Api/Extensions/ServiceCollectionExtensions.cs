using Api.Configuration;
using Api.Mappers;
using Api.Mappers.Interfaces;
using Api.Repositories;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Interfaces;
using Api.Services.Validation;
using Api.Services.Validation.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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
    
    public static void AddValidators(this IServiceCollection services)
    {
        services.AddScoped<IUserValidator, UserValidator>();
        services.AddScoped<ILoginValidator, LoginValidator>();
    }

    public static void AddMappers(this IServiceCollection services)
    {
        services.AddSingleton<ILoginMapper, LoginMapper>();
        services.AddSingleton<IUserMapper, UserMapper>();
        services.AddSingleton<IVaultMapper, VaultMapper>();
    }

    public static void AddCsrf(this IServiceCollection services, CsrfConfiguration csrfConfiguration)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = csrfConfiguration.HeaderName;
            options.Cookie.Name = csrfConfiguration.SessionCookieName;
        });
    }

    public static void AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {

            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Silmaril API",
                Version = "v1"
            });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Example : `Bearer eyJhbGciOiJIUzI1NiIs...`"
            });
    
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }
}