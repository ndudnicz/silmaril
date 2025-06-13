using Api.Entities.Dtos;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class AuthController(IAuthService authService): MyControllerV1
{
    [HttpPost]
    public async Task<IActionResult> Auth([FromBody] AuthDto authDto)
    {
        var token = await authService.AuthAsync(authDto);
        if (token == null)
        {
            return Unauthorized();
        }
        return Ok(await authService.AuthAsync(authDto));
    }
}