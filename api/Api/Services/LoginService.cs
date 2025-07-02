using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Repositories;
using Api.Services.Validation;

namespace Api.Services;

public class LoginService(
    ILoginRepository loginRepository,
    ITagService tagService,
    IUserRepository userRepository,
    IUserValidator userValidator,
    ILoginValidator loginValidator
) : ILoginService
{
    public async Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return LoginDto.FromLogin(await loginRepository.GetLoginsWithTagsByUserIdAsync(userId));
    }

    public async Task<List<LoginDto>> GetDeletedLoginsByUserIdAsync(Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return LoginDto.FromLogin(await loginRepository.GetLoginsWithTagsByUserIdAsync(userId, true));
    }
    
    public async Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        var login = Login.FromCreateLoginDto(createLoginDto);
        login.UserId = userId;
        if (createLoginDto.TagNames.Length > 0)
        {
            login.Tags = await tagService.GetTagsByNamesAsync(createLoginDto.TagNames);
        }
        return LoginDto.FromLogin(await loginRepository.CreateLoginAsync(login));
    }

    public async Task<List<LoginDto>> CreateLoginsAsync(List<CreateLoginDto> createLoginDtos, Guid userId)
    {
        if (createLoginDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        var logins = Login.FromCreateLoginDtos(createLoginDtos);
        var tags = await tagService.GetTagsAsync();
        logins.ForEach(login => AssignUserAndTagsToLogin(login, userId, tags));
        return LoginDto.FromLogin(await loginRepository.CreateLoginsAsync(logins));
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
        var login = await loginRepository.GetLoginWithTagsByUserIdAsync(dto.Id, userId);
        await ApplyDtoToLoginAsync(dto, login!);
        var updatedLogin = await loginRepository.UpdateLoginAsync(login!);
        return LoginDto.FromLogin(updatedLogin);
    }
    
    private async Task ApplyDtoToLoginAsync(UpdateLoginDto dto, Login login)
    {

        login.Tags = dto.TagNames.Length > 0 ? await tagService.GetTagsByNamesAsync(dto.TagNames) : [];
        login.EncryptedData = Convert.FromBase64String(dto.EncryptedDataBase64 ?? string.Empty);
        login.InitializationVector = Convert.FromBase64String(dto.InitializationVectorBase64 ?? string.Empty);
        login.EncryptionVersion = dto.EncryptionVersion;
        login.Deleted = dto.Deleted;
    }
    
    public async Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId)
    {
        if (updateLoginDtos.Count == 0)
        {
            return [];
        }
        await userValidator.EnsureExistsAsync(userId);
        await loginValidator.EnsureExistsByUserIdAsync(updateLoginDtos.Select(l => l.Id).ToList(), userId);
        var existingLogins = await loginRepository.GetLoginsByIdsAndUserIdWithTagsAsync(updateLoginDtos.Select(l => l.Id), userId);
        var existingLoginsDictionary = existingLogins.ToDictionary(l => l.Id, l => l);
        await ApplyDtosToLoginsAsync(updateLoginDtos, existingLoginsDictionary);
        return LoginDto.FromLogin(await loginRepository.UpdateLoginsAsync(existingLoginsDictionary.Values.ToList()));
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
            UpdateLoginFromDto(login, dto, allTags);
        }
    }
    
    private void UpdateLoginFromDto(Login login, UpdateLoginDto dto, List<Tag> allTags)
    {
        login.Tags = allTags
            .Where(tag => dto.TagNames.Contains(tag.Name, StringComparer.OrdinalIgnoreCase))
            .ToList();
        login.EncryptedData = Convert.FromBase64String(dto.EncryptedDataBase64 ?? string.Empty);
        login.InitializationVector = Convert.FromBase64String(dto.InitializationVectorBase64 ?? string.Empty);
        login.EncryptionVersion = dto.EncryptionVersion;
        login.Deleted = dto.Deleted;
    }

    public async Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId)
    {
        await userValidator.EnsureExistsAsync(userId);
        return await loginRepository.DeleteLoginByUserIdAsync(id, userId);
    }
}