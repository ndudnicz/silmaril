using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class LoginRepository(LoginContext db): ILoginRepository
{
    public async Task<Login?> GetLoginAsync(int id)
    {
        return await db.Logins.FirstOrDefaultAsync(x => x.Id == id);
    }
}