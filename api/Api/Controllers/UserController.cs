using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Mappers.Interfaces;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
public class UserController(
    ILogger<UserController> logger,
    IUserService userService
    ) : MyControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        return Ok(await userService.GetUserAsync(GetUserId()));
    }
    
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAsync(
        [FromServices] IAntiforgery antiforgery,
        [FromBody] CreateUserDto createUserDto
        )
    {
        try
        {
            await antiforgery.ValidateRequestAsync(HttpContext);
            var createdUser = await userService.CreateUserAsync(createUserDto);
            return Created($"api/user", createdUser);
        }
        catch (AntiforgeryValidationException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid CSRF token.");
        }
    }
    
    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserDto updateUserDto)
    {
        return Ok(await userService.UpdateUserAsync(GetUserId(), updateUserDto));
    }
    
    [HttpPut]
    [Route("password")]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdateUserPasswordDto updateUserPasswordDto)
    {
        return Ok(await userService.UpdateUserPasswordAsync(GetUserId(), updateUserPasswordDto));
    }
}