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
    ): MyControllerV1
{
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        return Ok(await vaultService.GetVaultsByUserIdAsync(GetUserId()));
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateVaultDto createVaultDto)
    {
        var createdVault = await vaultService.CreateVaultAsync(createVaultDto, GetUserId());
        return Created("api/vaults", createdVault);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateVaultDto updateVaultDto)
    {
        return Ok(await vaultService.UpdateVaultAsync(updateVaultDto, GetUserId()));
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
    {
        return Ok(await vaultService.DeleteVaultAsync(id, GetUserId()));
    }
}