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
        return Ok(await loginService.GetLoginsByUserIdAsync(GetUserId()));
    }
    
    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedLoginsAsync()
    {
        return Ok(await loginService.GetDeletedLoginsByUserIdAsync(GetUserId()));
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateLoginDto createLoginDto)
    {
        return Ok(await loginService.CreateLoginAsync(createLoginDto, GetUserId()));
    }
    
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkAsync([FromBody] List<CreateLoginDto> createLoginDtos)
    {
        return Ok(await loginService.CreateLoginsAsync(createLoginDtos, GetUserId()));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateLoginDto updateLoginDto)
    {
        return Ok(await loginService.UpdateLoginAsync(updateLoginDto, GetUserId()));
    }
    
    [HttpPut("bulk")]
    public async Task<IActionResult> UpdateBulkAsync([FromBody] List<UpdateLoginDto> updateLoginDtos)
    {
        return Ok(await loginService.UpdateLoginsAsync(updateLoginDtos, GetUserId()));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
    {
        return Ok(await loginService.DeleteLoginByUserIdAsync(id, GetUserId()));
    }
}