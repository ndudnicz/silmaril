using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services;

public class LoginService(
    ILoginRepository loginRepository,
    ITagService tagService,
    IUserValidator userValidator,
    ILoginValidator loginValidator,
    IVaultValidator vaultValidator,
    ILoginMapper loginMapper
) : ILoginService
{
    public async Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return loginMapper.ToDto(await loginRepository.GetLoginsByUserIdWithTagsAsync(userId));
    }

    public async Task<List<LoginDto>> GetDeletedLoginsByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return loginMapper.ToDto(await loginRepository.GetLoginsByUserIdWithTagsAsync(userId, deleted: true));
    }
    
    public async Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await vaultValidator.EnsureExistsByUserIdAsync(createLoginDto.VaultId, userId);
        var login = loginMapper.ToEntity(createLoginDto);
        login.UserId = userId;
        if (createLoginDto.TagNames.Length > 0)
        {
            login.Tags = await tagService.GetTagsByNamesAsync(createLoginDto.TagNames);
        }
        return loginMapper.ToDto(await loginRepository.CreateLoginAsync(login));
    }

    public async Task<List<LoginDto>> CreateLoginsAsync(List<CreateLoginDto> createLoginDtos, Guid userId)
    {
        if (createLoginDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        await vaultValidator.EnsureExistsByUserIdAsync(
            createLoginDtos.Select(c => c.VaultId).Distinct().ToList(), userId);
        var logins = loginMapper.ToEntity(createLoginDtos);
        var tags = await tagService.GetTagsAsync();
        logins.ForEach(login => AssignUserAndTagsToLogin(login, userId, tags));
        return loginMapper.ToDto(await loginRepository.CreateLoginsAsync(logins));
    }
    
    private void AssignUserAndTagsToLogin(Login login, Guid userId, List<Tag> availableTags)
    {
        tagService.EnsureAllTagNamesExist(login.TagNames, availableTags);
        login.UserId = userId;
        login.Tags = availableTags
            .Where(tag => login.TagNames.Contains(tag.Name, StringComparer.OrdinalIgnoreCase))
            .ToList();
    }

    public async Task<LoginDto> UpdateLoginAsync(UpdateLoginDto dto, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await loginValidator.EnsureExistsByUserIdAsync(dto.Id, userId);
        var login = await loginRepository.GetLoginWithTagsAsync(dto.Id);
        var tags = await tagService.GetTagsByNamesAsync(dto.TagNames);
        loginMapper.FillEntityFromUpdateDto(login!, dto, tags);
        var updatedLogin = await loginRepository.UpdateLoginAsync(login!);
        return loginMapper.ToDto(updatedLogin);
    }
    
    
    public async Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId)
    {
        if (updateLoginDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        await loginValidator.EnsureExistsByUserIdAsync(updateLoginDtos.Select(l => l.Id).ToList(), userId);
        var existingLogins = await loginRepository.GetLoginsByIdsWithTagsAsync(
            updateLoginDtos.Select(l => l.Id));
        var existingLoginsDictionary = existingLogins.ToDictionary(l => l.Id, l => l);
        await ApplyDtosToLoginsAsync(updateLoginDtos, existingLoginsDictionary);
        return loginMapper.ToDto(await loginRepository.UpdateLoginsAsync(existingLoginsDictionary.Values.ToList()));
    }
    
    private async Task ApplyDtosToLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Dictionary<Guid, Login> existingLoginsDictionary)
    {
        var allTags = await tagService.GetTagsAsync();
        var allTagNames = updateLoginDtos
            .SelectMany(dto => dto.TagNames)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        tagService.EnsureAllTagNamesExist(allTagNames, allTags);
        foreach (var dto in updateLoginDtos)
        {
            var login = existingLoginsDictionary[dto.Id];
            loginMapper.FillEntityFromUpdateDto(login, dto, allTags.Where(x => dto.TagNames.Contains(x.Name)).ToList());
        }
    }

    public async Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        await loginValidator.EnsureExistsByUserIdAsync(id, userId);
        return await loginRepository.DeleteLoginAsync(id);
    }
    
    public async Task<int> DeleteLoginsByUserIdAsync(List<Guid> ids, Guid userId)
    {
        if (ids.Count == 0)
        {
            return 0;
        }
        await userValidator.EnsureExistsAsync(userId);
        await loginValidator.EnsureExistsByUserIdAsync(ids, userId);
        return await loginRepository.DeleteLoginsAsync(ids);
    }
}