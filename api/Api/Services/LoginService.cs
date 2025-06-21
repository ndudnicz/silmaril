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
        return LoginDto.FromLogin(await loginRepository.GetLoginWithByUserIdTagsAsync(id, userId));
    }
    
    public async Task<IEnumerable<LoginDto>> GetLoginsByUserIdAsync(Guid userId)
    {
        return LoginDto.FromLogin(await loginRepository.GetLoginsWithByUserIdTagsAsync(userId));
    }

    public async Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto)
    {
        var login = Login.FromCreateLoginDto(createLoginDto);
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

    public async Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto)
    {
        if (await userRepository.UserExistsAsync(updateLoginDto.UserId) == false)
        {
            throw new UserNotFound(updateLoginDto.UserId);
        }
        var existingLogin = await loginRepository.GetLoginWithByUserIdTagsAsync(updateLoginDto.Id, updateLoginDto.UserId);
        existingLogin.Tags = await tagService.GetTagByNameBulkAsync(updateLoginDto.Tags.Select(t => t.Name).ToArray());
        existingLogin.EncryptedData = Convert.FromBase64String(updateLoginDto.EncryptedDataBase64 ?? string.Empty);
        existingLogin.Updated = DateTime.UtcNow;
        return LoginDto.FromLogin(await loginRepository.UpdateLoginAsync(existingLogin));
    }
}