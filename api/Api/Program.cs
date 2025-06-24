using Api.Extensions;
using Api.Helpers;
using Api.Repositories;
using Api.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddContexts(configuration);
var jwtSecretKey = CryptoHelper.GenerateRandomByte(32);
builder.Services.AddJwtAuthentication(configuration, jwtSecretKey);
builder.Services.AddRepositories();
builder.Services.AddServices(configuration, jwtSecretKey);
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