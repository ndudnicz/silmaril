using Api.Configuration;
using Api.Entities.Dtos.Authentication;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class AuthController(
    IAuthService authService,
    CsrfConfiguration csrfConfiguration,
    ILogger<AuthController> logger) : ControllerV1
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Auth(
        [FromServices] IAntiforgery antiforgery,
        [FromBody] AuthDto authDto
        )
    {
        try
        {
            await antiforgery.ValidateRequestAsync(HttpContext);
            var authResponse = await authService.AuthAsync(authDto);
            Response.Cookies.Append("refreshToken", authResponse.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = authResponse.RefreshTokenExpiration
            });
            logger.LogInformation("User {Username} authenticated successfully", authDto.Username);
            return Ok(authResponse);
        }
        catch (AntiforgeryValidationException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid CSRF token.");
        }
    }

    [HttpGet("csrf-cookie")]
    [AllowAnonymous]
    public IActionResult GetCsrfTokenAsync([FromServices] IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        Response.Cookies.Append(csrfConfiguration.CookieName, tokens.RequestToken!,
            new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Lax
            });
        return Ok();
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromServices] IAntiforgery antiforgery)
    {
        try
        {
            await antiforgery.ValidateRequestAsync(HttpContext);
            var refreshToken = HttpContext.Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized();
            var authResponse = await authService.RefreshTokenAsync(refreshToken);
            Response.Cookies.Append(JwtConfiguration.RefreshTokenCookieName, authResponse.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = authResponse.RefreshTokenExpiration
            });

            return Ok(authResponse);
        }
        catch (AntiforgeryValidationException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid CSRF token.");
        }
    }

    [HttpPost("signout")]
    public async Task<IActionResult> Signout()
    {
        await authService.RevokeRefreshTokenByUserIdAsync(GetUserId());
        Response.Cookies.Delete(JwtConfiguration.RefreshTokenCookieName);
        Response.Cookies.Delete(csrfConfiguration.CookieName);
        Response.Cookies.Delete(CsrfConfiguration.SessionCookieName);
        return Ok("Logged out successfully");
    }
}