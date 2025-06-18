using Api.Controllers.Attributes;
using Api.Entities.Dtos.Authentication;
using Api.Exceptions;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class AuthController(
    IAuthService authService,
    ILogger<AuthController> logger): MyControllerV1
{
    [HttpPost]
    public async Task<IActionResult> Auth([FromBody] AuthDto authDto)
    {
        try
        {
            return Ok(await authService.AuthAsync(authDto));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Authentication failed for user {Username}", authDto.Username);
            return BadRequest("Authentication failed");
        }
    }
    
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] AuthRefreshDto authRefreshDto)
    {
        try
        {
            return Ok(await authService.RefreshTokenAsync(authRefreshDto.RefreshToken));
        }
        catch (InvalidRefreshToken ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to refresh token for user with refresh token {RefreshToken}", authRefreshDto.RefreshToken);
            return BadRequest("Failed to refresh token");
        }
    }
}