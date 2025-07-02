using Api.Entities.Dtos;
using Api.Services;
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
        try
        {
            return Ok(UserDto.FromUser(await userService.GetUserAsync(GetUserId())));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user");
            return BadRequest(ex.Message);
        }
    }
    
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAsync([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.CreateUserAsync(createUserDto)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating user");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.UpdateUserAsync(GetUserId(), updateUserDto)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating user");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    [HttpPut]
    [Route("password")]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdateUserPasswordDto updateUserPasswordDto)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.UpdateUserPasswordAsync(GetUserId(), updateUserPasswordDto)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating user password");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
}