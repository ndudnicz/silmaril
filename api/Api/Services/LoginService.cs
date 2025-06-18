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
    public async Task<Login> GetLoginByUserIdAsync(Guid id, Guid userId)
    {
        return await loginRepository.GetLoginWithByUserIdTagsAsync(id, userId);
    }
    
    public async Task<IEnumerable<Login>> GetLoginsByUserIdAsync(Guid userId)
    {
        return await loginRepository.GetLoginsWithByUserIdTagsAsync(userId);
    }

    public async Task<Login> CreateLoginAsync(CreateLoginDto createLoginDto)
    {
        var login = Login.FromCreateLoginDto(createLoginDto);
        if (createLoginDto.TagNames.Length > 0)
        {
            login.Tags = await tagService.GetTagByNameBulkAsync(createLoginDto.TagNames);
        }
        return await loginRepository.CreateLoginAsync(login);
    }

    public async Task<Login> AddTagToLoginAsync(Guid loginId, string tagName)
    {
        var login = await loginRepository.GetLoginWithTagsAsync(loginId);
        if (login.Tags.Any(t => t.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new TagAlreadyExistsForLogin(tagName);
        }

        var tag = await tagService.GetTagByNameAsync(tagName);
        login.Tags.Add(tag!);
        return await loginRepository.UpdateLoginAsync(login);
    }

    public async Task<Login> UpdateLoginAsync(UpdateLoginDto updateLoginDto)
    {
        if (await userRepository.UserExistsAsync(updateLoginDto.UserId) == false)
        {
            throw new UserNotFound(updateLoginDto.UserId);
        }
        var existingLogin = await loginRepository.GetLoginWithByUserIdTagsAsync(updateLoginDto.Id, updateLoginDto.UserId);
        existingLogin.Tags = await tagService.GetTagByNameBulkAsync(updateLoginDto.Tags.Select(t => t.Name).ToArray());
        existingLogin.EncryptedData = updateLoginDto.EncryptedData;
        existingLogin.Updated = DateTime.UtcNow;
        return await loginRepository.UpdateLoginAsync(existingLogin);
    }
}