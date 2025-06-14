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
    [HttpGet("{id:int}")]

    public async Task<IActionResult> GetAsync([FromRoute] int id)
    {
        return Ok(await loginService.GetLoginAsync(id));
    }
    
    [HttpPut("{id:int}")]
    public async Task<IActionResult> AddTagToLoginAsync(
        [FromRoute] int id,
        [FromBody] string tagName
    )
    {
        try
        {
            return Ok(await loginService.AddTagToLoginAsync(id, tagName));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error adding tag to login");
            return BadRequest(ex.Message);
        }
    }
}