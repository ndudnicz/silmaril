using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class LoginRepository(AppDbContext db): ILoginRepository
{
    public async Task<Login?> GetLoginAsync(int id)
    {
        return await db.Logins
            .FirstOrDefaultAsync(x => x.Id == id);
    }
    
    public async Task<Login?> GetLoginWithTagsAsync(int id)
    {
        return await db.Logins
            .Include(l => l.Tags)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Login> UpdateLoginAsync(Login login)
    {
        db.Logins.Update(login);
        await db.SaveChangesAsync();
        return login;
    }
}