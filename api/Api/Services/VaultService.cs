using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services;

public class VaultService(
    IVaultRepository vaultRepository,
    IVaultValidator vaultValidator,
    IVaultMapper vaultMapper,
    ILoginRepository loginRepository
) : IVaultService
{
    private const string DefaultFirstVaultName = "Default Vault";
    
    public async Task<List<VaultDto>> GetVaultsByUserIdAsync(Guid userId)
    {
        return vaultMapper.ToDto(await vaultRepository.GetVaultsByUserIdAsync(userId));
    }

    public async Task<VaultDto> CreateVaultAsync(CreateVaultDto createVaultDto, Guid userId)
    {
        var vault = vaultMapper.ToEntity(createVaultDto);
        vault.UserId = userId;
        return vaultMapper.ToDto(await vaultRepository.CreateVaultAsync(vault));
    }
    
    public async Task<VaultDto> CreateUserDefaultFirstVaultAsync(Guid userId)
    {
        return vaultMapper.ToDto(await vaultRepository.CreateVaultAsync(new Vault
        {
            Name = DefaultFirstVaultName,
            UserId = userId
        }));
    }

    public async Task<VaultDto> UpdateVaultAsync(UpdateVaultDto updateVaultDto, Guid userId)
    {
        await vaultValidator.EnsureExistsByUserIdAsync(updateVaultDto.Id, userId);
        var existingVault = await vaultRepository.GetVaultAsync(updateVaultDto.Id);
        vaultMapper.FillEntityFromUpdateDto(existingVault!, updateVaultDto);
        return vaultMapper.ToDto(await vaultRepository.UpdateVaultAsync(existingVault!));
    }

    public async Task<int> DeleteVaultAsync(Guid id, Guid userId)
    {
        await vaultValidator.EnsureExistsByUserIdAsync(id, userId);
        // Forbid deleting the last vault
        await vaultValidator.EnsureMultipleVaultsExistAsync(userId);
        var logins = await loginRepository.GetLoginsByVaultIdWithTagsAsync(id);
        if (logins.Count > 0)
        {
            await loginRepository.UpdateLoginsAsync(logins.Select(l =>
            {
                l.Deleted = true;
                l.VaultId = null;
                return l;
            }).ToList());
        }
        var result = await vaultRepository.DeleteVaultAsync(id);
        return result;
    }
}