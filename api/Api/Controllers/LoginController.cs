using Api.Entities.Dtos;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
public class LoginController(
    ILogger<LoginController> logger,
    ILoginService loginService
    ) : MyControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetLoginsAsync()
    {
        try
        {
            var r = await loginService.GetLoginsByUserIdAsync(GetUserId());
            return Ok(r);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching logins for user with ID {UserId}", GetUserId());
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateLoginDto createLoginDto)
    {
        try
        {
            return Ok(await loginService.CreateLoginAsync(createLoginDto, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating login");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateLoginDto updateLoginDto)
    {
        try
        {
            return Ok(await loginService.UpdateLoginAsync(updateLoginDto, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating login with ID {Id}", updateLoginDto.Id);
            return BadRequest(ex.Message);
        }
    }
}