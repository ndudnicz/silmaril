using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Delete;
using Api.Entities.Dtos.Update;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
public class LoginController(
    ILogger<LoginController> logger,
    ICredentialService credentialService
    ) : ControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetLoginsAsync()
    {
        var userId =  GetUserId();
        var result = await credentialService.GetByUserIdAsync(userId);
        logger.LogInformation("Found {Count} credentials for user {UserId}", result.Count, userId);
        return Ok(result);
    }

    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedLoginsAsync()
    {
        var userId =  GetUserId();
        var result = await credentialService.GetDeletedByUserIdAsync(userId);
        logger.LogInformation("Found {Count} deleted credentials for user {UserId}", result.Count, userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateLoginDto createCredentialDto)
    {
        var userId = GetUserId();
        var createdLogin = await credentialService.CreateAsync(createCredentialDto, GetUserId());
        logger.LogInformation("Created credential with id {CredentialId} for user {UserId}", createdLogin.Id, userId);
        return Created($"api/logins", createdLogin);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkAsync([FromBody] List<CreateLoginDto> createCredentialDtos)
    {
        var userId =  GetUserId();
        var createdLogins = await credentialService.CreateAsync(createCredentialDtos, GetUserId());
        logger.LogInformation("Created {Count} credentials for user {UserId}", createdLogins.Count, userId);
        return Created($"api/logins", createdLogins);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateLoginDto updateCredentialDto)
    {
        var userId =  GetUserId();
        var result = await credentialService.UpdateAsync(updateCredentialDto, userId);
        logger.LogInformation("Updated credential with id {CredentialId} for user {UserId}", result.Id, userId);
        return Ok(result);
    }

    [HttpPut("bulk")]
    public async Task<IActionResult> UpdateBulkAsync([FromBody] List<UpdateLoginDto> updateCredentialDtos)
    {
        var userId =  GetUserId();
        var result = await credentialService.UpdateAsync(updateCredentialDtos, userId);
        logger.LogInformation("Updated {Count} credentials for user {UserId}", result.Count, userId);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
    {
        var userId =  GetUserId();
        var result = await credentialService.DeleteAsync(id, userId);
        logger.LogInformation("Deleted credential with id {CredentialId} for user {UserId}", id, userId);
        return Ok(result);
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteBulkAsync([FromBody] DeleteLoginsDto deleteCredentialsDto)
    {
        var userId =  GetUserId();
        var result = await credentialService.DeleteAsync(deleteCredentialsDto.Ids.ToList(), userId);
        logger.LogInformation("Deleted {Count} credentials for user {UserId}", result, userId);
        return Ok(result);
    }
}