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
    public async Task<LoginDto> GetLoginByUserIdAsync(Guid id, Guid userId)
    {
        return LoginDto.FromLogin(await loginRepository.GetLoginWithTagsByUserIdAsync(id, userId));
    }
    
    public async Task<IEnumerable<LoginDto>> GetLoginsByUserIdAsync(Guid userId)
    {
        return LoginDto.FromLogin(await loginRepository.GetLoginsWithTagsByUserIdAsync(userId));
    }

    public async Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId)
    {
        var login = Login.FromCreateLoginDto(createLoginDto);
        login.UserId = userId;
        if (createLoginDto.TagNames.Length > 0)
        {
            login.Tags = await tagService.GetTagByNameBulkAsync(createLoginDto.TagNames);
        }
        return LoginDto.FromLogin(await loginRepository.CreateLoginAsync(login));
    }

    public async Task<LoginDto> AddTagToLoginAsync(Guid loginId, string tagName)
    {
        var login = await loginRepository.GetLoginWithTagsAsync(loginId);
        if (login.Tags.Any(t => t.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new TagAlreadyExistsForLogin(tagName);
        }

        var tag = await tagService.GetTagByNameAsync(tagName);
        login.Tags.Add(tag!);
        return LoginDto.FromLogin(await loginRepository.UpdateLoginAsync(login));
    }

    public async Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId)
    {
        if (await userRepository.UserExistsAsync(userId) == false)
        {
            throw new UserNotFound(userId);
        }
        var existingLogin = await loginRepository.GetLoginWithTagsByUserIdAsync(updateLoginDto.Id, userId);
        existingLogin.Tags = await tagService.GetTagByNameBulkAsync(updateLoginDto.TagNames.ToArray());
        existingLogin.EncryptedData = Convert.FromBase64String(updateLoginDto.EncryptedDataBase64 ?? string.Empty);
        existingLogin.Updated = DateTime.UtcNow;
        existingLogin.EncryptionVersion = updateLoginDto.EncryptionVersion;
        return LoginDto.FromLogin(await loginRepository.UpdateLoginAsync(existingLogin));
    }

    public async Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId)
    {
        return await loginRepository.DeleteLoginByUserIdAsync(id, userId);
    }
}