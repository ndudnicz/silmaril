using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
public class VaultController(
    ILogger<VaultController> logger,
    IVaultService vaultService
    ) : ControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        var userId = GetUserId();
        var result = await vaultService.GetByUserIdAsync(userId);
        logger.LogInformation("User {UserId} getting vaults successfully", userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateVaultDto createVaultDto)
    {
        var userId = GetUserId();
        var result = await vaultService.CreateAsync(createVaultDto, userId);
        logger.LogInformation("User {UserId} added vault {VaultName} successfully", userId, result.Name);
        return Created("api/vaults", result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateVaultDto updateVaultDto)
    {
        var userId = GetUserId();
        var result = await vaultService.UpdateAsync(updateVaultDto, userId);
        logger.LogInformation("User {UserId} updated vault {VaultName} successfully", userId, result.Name);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
    {
        var userId = GetUserId();
        var result = await vaultService.DeleteAsync(id, userId);
        logger.LogInformation("User {UserId} deleted vault with id {VaultId} successfully", userId, id);
        return Ok(result);
    }
}