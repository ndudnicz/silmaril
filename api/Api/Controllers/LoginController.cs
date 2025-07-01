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
            return Ok(await loginService.GetLoginsByUserIdAsync(GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching logins for user with ID {UserId}", GetUserId());
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
    
    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedLoginsAsync()
    {
        try
        {
            return Ok(await loginService.GetDeletedLoginsByUserIdAsync(GetUserId()));
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
    
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkAsync([FromBody] IEnumerable<CreateLoginDto> createLoginDtos)
    {
        try
        {
            return Ok(await loginService.CreateLoginsAsync(createLoginDtos, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating bulk logins");
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
    
    [HttpPut("bulk")]
    public async Task<IActionResult> UpdateBulkAsync([FromBody] List<UpdateLoginDto> updateLoginDtos)
    {
        try
        {
            return Ok(await loginService.UpdateLoginsAsync(updateLoginDtos, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating bulk logins");
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
    {
        try
        {
            return Ok(await loginService.DeleteLoginByUserIdAsync(id, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting login with ID {Id}", id);
            return BadRequest(ex.InnerException?.Message ?? ex.Message);
        }
    }
}