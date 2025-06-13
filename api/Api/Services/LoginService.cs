using Api.Entities;
using Api.Repositories;

namespace Api.Services;

public class LoginService(ILoginRepository loginRepository): ILoginService
{
    public async Task<Login?> GetLoginAsync(int id)
    {
        return await loginRepository.GetLoginAsync(id);
    }
}