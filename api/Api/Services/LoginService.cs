using Api.Entities;
using Api.Repositories;
using Api.Services.Exceptions;

namespace Api.Services;

public class LoginService(
    ILoginRepository loginRepository,
    ITagService tagService
    ): ILoginService
{
    public async Task<Login?> GetLoginAsync(int id)
    {
        return await loginRepository.GetLoginAsync(id);
    }

    public async Task<Login> AddTagToLoginAsync(int loginId, string tagName)
    {
        var login = await loginRepository.GetLoginAsync(loginId);
        if (login == null)
        {
            throw LoginServiceException.LoginNotFound(loginId);
        }

        try
        {
            var tag = await tagService.GetTagByNameAsync(tagName);
            login.Tags.Add(tag!);
            return await loginRepository.UpdateLoginAsync(login);
        }
        catch
        {
            throw;
        }
    }
}