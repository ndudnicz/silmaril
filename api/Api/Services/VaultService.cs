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
    ICredentialRepository credentialRepository
) : IVaultService
{
    private const string DefaultFirstVaultName = "Default Vault";

    public async Task<List<VaultDto>> GetByUserIdAsync(Guid userId)
    {
        return vaultMapper.ToDto(await vaultRepository.GetByUserIdAsync(userId));
    }

    public async Task<VaultDto> CreateAsync(CreateVaultDto createVaultDto, Guid userId)
    {
        var vault = vaultMapper.ToEntity(createVaultDto);
        vault.UserId = userId;
        return vaultMapper.ToDto(await vaultRepository.CreateAsync(vault));
    }

    public async Task<VaultDto> CreateUserDefaultFirstVaultAsync(Guid userId)
    {
        return vaultMapper.ToDto(await vaultRepository.CreateAsync(new Vault
        {
            Name = DefaultFirstVaultName,
            UserId = userId
        }));
    }

    public async Task<VaultDto> UpdateAsync(UpdateVaultDto updateVaultDto, Guid userId)
    {
        await vaultValidator.EnsureExistsByUserIdAsync(updateVaultDto.Id, userId);
        var existingVault = await vaultRepository.GetAsync(updateVaultDto.Id);
        vaultMapper.FillEntityFromUpdateDto(existingVault!, updateVaultDto);
        return vaultMapper.ToDto(await vaultRepository.UpdateAsync(existingVault!));
    }

    public async Task<int> DeleteAsync(Guid id, Guid userId)
    {
        await vaultValidator.EnsureExistsByUserIdAsync(id, userId);
        // Forbid deleting the last vault
        await vaultValidator.EnsureMultipleVaultsExistAsync(userId);
        var logins = await credentialRepository.GetByVaultIdWithTagsAsync(id);
        if (logins.Count > 0)
        {
            await credentialRepository.UpdateAsync(logins.Select(l =>
            {
                l.Deleted = true;
                l.VaultId = null;
                return l;
            }).ToList());
        }
        var result = await vaultRepository.DeleteAsync(id);
        return result;
    }
}