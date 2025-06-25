using Api.Configuration;
using Api.Extensions;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
var jwtSecretKeyBae64 = configuration["Jwt:SecretKeyBase64"];
if (string.IsNullOrEmpty(jwtSecretKeyBae64))
{
    throw new InvalidOperationException("The environment variable 'SILMARIL_JWT_SECRET_KEY_BASE64' is not defined. ");
}
if (jwtSecretKeyBae64 is "ZGVmYXVsdC1zZWNyZXQta2V5")
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
var jwtSecretKey = Convert.FromBase64String(jwtSecretKeyBae64!);
var jwtConfiguration = new JwtConfiguration
{
    JwtSecretKey = jwtSecretKey,
    JwtValidIssuer = configuration["Jwt:ValidIssuer"] ??
                     throw new InvalidOperationException("Jwt:ValidIssuer is not defined in the configuration."),
    JwtValidAudience = configuration["Jwt:ValidAudience"] ??
                       throw new InvalidOperationException("Jwt:ValidAudience is not defined in the configuration.")
};

builder.Services.AddContexts(mysqlConfiguration);
builder.Services.AddJwtAuthentication(jwtConfiguration);
builder.Services.AddRepositories();
builder.Services.AddServices(jwtConfiguration);
builder.Services.AddControllers();
builder.Services.AddRouting(opt => opt.LowercaseUrls = true);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();
builder.Services.AddSwaggerGen(c =>
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

var app = builder.Build();
var allowedOrigins = configuration["AllowedOrigins"]!.Split(",");
app.UseCors(b =>
        b.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()  // Add AllowCredentials for SignalR to work with cookies or authorization headers
);
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Silmaril API V1");
    });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();