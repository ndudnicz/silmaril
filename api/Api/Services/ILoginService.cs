using Api.Entities;

namespace Api.Services;

public interface ILoginService
{
    public Task<Login?> GetLoginAsync(int id);
    public Task<Login> AddTagToLoginAsync(int loginId, string tagName);
}