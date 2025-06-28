using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Repositories;

namespace Api.Services;

public class LoginService(
    ILoginRepository loginRepository,
    ITagService tagService,
    IUserRepository userRepository
) : ILoginService
{
    public async Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId)
    {
        return LoginDto.FromLogin(await loginRepository.GetLoginsWithTagsByUserIdAsync(userId));
    }

    public async Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId)
    {
        var login = Login.FromCreateLoginDto(createLoginDto);
        login.UserId = userId;
        if (createLoginDto.TagNames.Length > 0)
        {
            login.Tags = await tagService.GetTagsByNamesAsync(createLoginDto.TagNames);
        }
        return LoginDto.FromLogin(await loginRepository.CreateLoginAsync(login));
    }

    public async Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId)
    {
        if (await userRepository.UserExistsAsync(userId) == false)
        {
            throw new UserNotFound("id", userId.ToString());
        }
        var existingLogin = await loginRepository.GetLoginWithTagsByUserIdAsync(updateLoginDto.Id, userId);
        if (updateLoginDto.TagNames.Length > 0)
        {
            existingLogin.Tags = await tagService.GetTagsByNamesAsync(updateLoginDto.TagNames.ToArray());
        }
        existingLogin.EncryptedData = Convert.FromBase64String(updateLoginDto.EncryptedDataBase64 ?? string.Empty);
        existingLogin.EncryptionVersion = updateLoginDto.EncryptionVersion;
        existingLogin.Deleted = updateLoginDto.Deleted;
        existingLogin.InitializationVector = Convert.FromBase64String(updateLoginDto.InitializationVectorBase64 ?? string.Empty);
        return LoginDto.FromLogin(await loginRepository.UpdateLoginAsync(existingLogin));
    }

    public async Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId)
    {
        if (await userRepository.UserExistsAsync(userId) == false)
        {
            throw new UserNotFound("id", userId.ToString());
        }
        var existingLogins = await loginRepository.GetLoginsWithTagsByUserIdBulkAsync(updateLoginDtos.Select(l => l.Id), userId);
        var existingLoginsDictionary = existingLogins.ToDictionary(x => x.Id);
        if (existingLogins.Count != updateLoginDtos.Count)
        {
            var missingIds = updateLoginDtos
                .Where(l => !existingLoginsDictionary.ContainsKey(l.Id))
                .Select(l => l.Id).ToList();
            throw new LoginsNotFoundBulk(missingIds);
        }

        var existingTags = await tagService.GetTagsAsync();
        foreach (var updateLoginDto in updateLoginDtos)
        {
            if (!existingLoginsDictionary.TryGetValue(updateLoginDto.Id, out var existingLogin))
            {
                throw new LoginNotFound(updateLoginDto.Id);
            }
            if (updateLoginDto.TagNames.Length > 0)
            {
                existingLogin.Tags = existingTags.Where(t => updateLoginDto.TagNames.Contains(t.Name, StringComparer.OrdinalIgnoreCase)).ToList();
            }
            existingLogin.EncryptedData = Convert.FromBase64String(updateLoginDto.EncryptedDataBase64 ?? string.Empty);
            existingLogin.InitializationVector = Convert.FromBase64String(updateLoginDto.InitializationVectorBase64 ?? string.Empty);
            existingLogin.EncryptionVersion = updateLoginDto.EncryptionVersion;
            existingLogin.Deleted = updateLoginDto.Deleted;
        }
        return LoginDto.FromLogin(await loginRepository.UpdateLoginsAsync(existingLoginsDictionary.Values.ToList()));
    }

    public async Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId)
    {
        return await loginRepository.DeleteLoginByUserIdAsync(id, userId);
    }
}