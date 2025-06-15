using Api.Controllers.Attributes;
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
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetAsync([FromRoute] Guid id)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.GetUserAsync(id)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user");
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetByUserNameAsync([FromRoute] string username)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.GetUserByUserNameAsync(username)));
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
    [ValidateUserIdMatchesDto]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.UpdateUserAsync(updateUserDto)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating user");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    [HttpPut]
    [Route("password")]
    [ValidateUserIdMatchesDto("Id")]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdateUserPasswordDto updateUserPasswordDto)
    {
        try
        {
            return Ok(UserDto.FromUser(await userService.UpdateUserPasswordAsync(updateUserPasswordDto)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating user password");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
}