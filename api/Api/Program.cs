using Api.Configuration;
using Api.Extensions;
using Api.Middlewares;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
var (jwtConfiguration, mysqlConfiguration, csrfConfiguration) = ConfigurationParser.Parse(configuration);
builder.Services.AddSingleton<CsrfConfiguration>(_ => csrfConfiguration);
builder.Services.AddSingleton<JwtConfiguration>(_ => jwtConfiguration);
builder.Services.AddContexts(mysqlConfiguration);
builder.Services.AddJwtAuthentication(jwtConfiguration);
builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddCsrf(csrfConfiguration);
builder.Services.AddControllers();
builder.Services.AddRouting(opt => opt.LowercaseUrls = true);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();
builder.Services.AddSwagger();

var app = builder.Build();
app.UseMiddleware<ErrorHandlingMiddleware>();
var allowedOrigins = configuration["AllowedOrigins"]!.Split(",");
app.UseCors(b =>
        b.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
);
app.Use(async (context, next) =>
{
    var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
    var tokens = antiforgery.GetAndStoreTokens(context);
    context.Response.Cookies.Append(csrfConfiguration.CookieName, tokens.RequestToken!,
        new CookieOptions { HttpOnly = false, Secure = true, SameSite = SameSiteMode.Lax });

    await next();
});
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