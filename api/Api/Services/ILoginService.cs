using Api.Entities;

namespace Api.Services;

public interface ILoginService
{
    public Task<Login?> GetLoginAsync(int id);
}