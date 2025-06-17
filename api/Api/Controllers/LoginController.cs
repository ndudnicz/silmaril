using Api.Controllers.Attributes;
using Api.Entities;
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
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetAsync([FromRoute] Guid id)
    {
        try
        {
            return Ok(await loginService.GetLoginAsync(id));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching login with ID {Id}", id);
            return NotFound(ex.Message);
        }
    }

    [HttpGet("user/{userId:guid}")]
    public Task<IActionResult> GetLoginsAsync([FromRoute] Guid userId)
    {
        throw new NotImplementedException();
    }
    
    [HttpPost]
    [ValidateUserIdMatchesDto]
    public async Task<IActionResult> CreateAsync([FromBody] CreateLoginDto createLoginDto)
    {
        try
        {
            return Ok(await loginService.CreateLoginAsync(createLoginDto));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating login");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    // [HttpPut("{id:guid}/tag/{tagName}")]
    // public async Task<IActionResult> AddTagToLoginAsync(
    //     [FromRoute] Guid id,
    //     [FromRoute] string tagName
    // )
    // {
    //     try
    //     {
    //         return Ok(await loginService.AddTagToLoginAsync(id, tagName));
    //     }
    //     catch (Exception ex)
    //     {
    //         logger.LogError(ex, "Error adding tag to login");
    //         return BadRequest(ex.Message);
    //     }
    // }

    [HttpPut]
    [ValidateUserIdMatchesDto]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateLoginDto updateLoginDto)
    {
        try
        {
            return Ok(await loginService.UpdateLoginAsync(updateLoginDto));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating login with ID {Id}", updateLoginDto.Id);
            return BadRequest(ex.Message);
        }
    }
}