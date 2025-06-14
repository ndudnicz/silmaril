using Api.Entities.Dtos.Authentication;
using Api.Services;
using Api.Services.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class AuthController(IAuthService authService): MyControllerV1
{
    [HttpPost]
    public async Task<IActionResult> Auth([FromBody] AuthDto authDto)
    {
        try
        {
            return Ok(await authService.AuthAsync(authDto));
        }
        catch (InvalidPassword ex)
        {
            return Unauthorized(ex.Message);
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
    }
}