using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services;

public class CredentialService(
    ICredentialRepository credentialRepository,
    ITagService tagService,
    IUserValidator userValidator,
    ICredentialValidator credentialValidator,
    IVaultValidator vaultValidator,
    ICredentialMapper credentialMapper
) : ICredentialService
{
    public async Task<List<LoginDto>> GetByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return credentialMapper.ToDto(await credentialRepository.GetByUserIdWithTagsAsync(userId));
    }

    public async Task<List<LoginDto>> GetDeletedByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return credentialMapper.ToDto(await credentialRepository.GetByUserIdWithTagsAsync(userId, deleted: true));
    }

    public async Task<LoginDto> CreateAsync(CreateLoginDto createCredentialDto, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await vaultValidator.EnsureExistsByUserIdAsync(createCredentialDto.VaultId, userId);
        var credential = credentialMapper.ToEntity(createCredentialDto);
        credential.UserId = userId;
        if (createCredentialDto.TagNames.Length > 0)
        {
            credential.Tags = await tagService.GetByNamesAsync(createCredentialDto.TagNames);
        }
        return credentialMapper.ToDto(await credentialRepository.CreateAsync(credential));
    }

    public async Task<List<LoginDto>> CreateAsync(List<CreateLoginDto> createLoginDtos, Guid userId)
    {
        if (createLoginDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        await vaultValidator.EnsureExistsByUserIdAsync(
            createLoginDtos.Select(c => c.VaultId).Distinct().ToList(), userId);
        var logins = credentialMapper.ToEntity(createLoginDtos);
        var tags = await tagService.GetAsync();
        logins.ForEach(login => AssignUserAndTagsToLogin(login, userId, tags));
        return credentialMapper.ToDto(await credentialRepository.CreateAsync(logins));
    }

    private void AssignUserAndTagsToLogin(Login login, Guid userId, List<Tag> availableTags)
    {
        tagService.EnsureAllTagNamesExist(login.TagNames, availableTags);
        login.UserId = userId;
        login.Tags = availableTags
            .Where(tag => login.TagNames.Contains(tag.Name, StringComparer.OrdinalIgnoreCase))
            .ToList();
    }

    public async Task<LoginDto> UpdateAsync(UpdateLoginDto updateCredentialDto, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await credentialValidator.EnsureExistsByUserIdAsync(updateCredentialDto.Id, userId);
        if (updateCredentialDto.VaultId.HasValue)
        {
            await vaultValidator.EnsureExistsByUserIdAsync(updateCredentialDto.VaultId.Value, userId);
        }
        var credential = await credentialRepository.GetWithTagsAsync(updateCredentialDto.Id);
        var tags = await tagService.GetByNamesAsync(updateCredentialDto.TagNames);
        credentialMapper.FillEntityFromUpdateDto(credential!, updateCredentialDto, tags);
        var updatedCredential = await credentialRepository.UpdateAsync(credential!);
        return credentialMapper.ToDto(updatedCredential);
    }


    public async Task<List<LoginDto>> UpdateAsync(List<UpdateLoginDto> updateCredentialDtos, Guid userId)
    {
        if (updateCredentialDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        await credentialValidator.EnsureExistsByUserIdAsync(updateCredentialDtos.Select(l => l.Id).ToList(), userId);
        if (updateCredentialDtos.Any(dto => dto.VaultId.HasValue))
        {
            var vaultIds = updateCredentialDtos
                .Where(dto => dto.VaultId.HasValue)
                .Select(dto => dto.VaultId!.Value)
                .Distinct()
                .ToList();
            await vaultValidator.EnsureExistsByUserIdAsync(vaultIds, userId);
        }
        var existingCredentials = await credentialRepository.GetByIdsWithTagsAsync(
            updateCredentialDtos.Select(l => l.Id));
        var existingCredentialsDictionary = existingCredentials.ToDictionary(l => l.Id, l => l);
        await ApplyDtosToLoginsAsync(updateCredentialDtos, existingCredentialsDictionary);
        return credentialMapper.ToDto(await credentialRepository.UpdateAsync(existingCredentialsDictionary.Values.ToList()));
    }

    private async Task ApplyDtosToLoginsAsync(
        List<UpdateLoginDto> updateCredentialDtos,
        Dictionary<Guid, Login> existingCredentialsDictionary)
    {
        var allTags = await tagService.GetAsync();
        var allTagNames = updateCredentialDtos
            .SelectMany(dto => dto.TagNames)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        tagService.EnsureAllTagNamesExist(allTagNames, allTags);
        foreach (var dto in updateCredentialDtos)
        {
            var login = existingCredentialsDictionary[dto.Id];
            credentialMapper.FillEntityFromUpdateDto(
                login,
                dto,
                allTags.Where(x => dto.TagNames.Contains(x.Name))
                    .ToList());
        }
    }

    public async Task<int> DeleteAsync(Guid id, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await credentialValidator.EnsureExistsByUserIdAsync(id, userId);
        return await credentialRepository.DeleteAsync(id);
    }

    public async Task<int> DeleteAsync(List<Guid> ids, Guid userId)
    {
        if (ids.Count == 0)
        {
            return 0;
        }
        await userValidator.EnsureExistsAsync(userId);
        await credentialValidator.EnsureExistsByUserIdAsync(ids, userId);
        return await credentialRepository.DeleteAsync(ids);
    }
}