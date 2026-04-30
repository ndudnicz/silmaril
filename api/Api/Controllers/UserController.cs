using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
public class UserController(
    ILogger<UserController> logger,
    IUserService userService
    ) : ControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        var userId = GetUserId();
        var result = await userService.GetAsync(userId);
        logger.LogInformation("User {userId} successfully retrieved.", userId);
        return Ok(result);
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
            var createdUser = await userService.CreateAsync(createUserDto);
            logger.LogInformation("User {userId} successfully created.", createdUser.Id);
            return Created($"api/user", createdUser);
        }
        catch (AntiforgeryValidationException)
        {
            logger.LogWarning("Failed to create user: Invalid CSRF token.");
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid CSRF token.");
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserDto updateUserDto)
    {
        var userId = GetUserId();
        var result = await userService.UpdateAsync(userId, updateUserDto);
        logger.LogInformation("User {userId} successfully updated.", userId);
        return Ok(result);
    }

    [HttpPut]
    [Route("password")]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdateUserPasswordDto updateUserPasswordDto)
    {
        var userId = GetUserId();
        var result = await userService.UpdatePasswordAsync(userId, updateUserPasswordDto);
        logger.LogInformation("User {userId} password successfully updated.", userId);
        return Ok(result);
    }
}