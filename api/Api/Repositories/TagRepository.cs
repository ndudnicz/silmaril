using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class TagRepository(AppDbContext db): ITagRepository
{
    public async Task<Tag?> GetTagAsync(int id)
    {
        return await db.Tags.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Tag?> GetTagByNameAsync(string name)
    {
        return await db.Tags.FirstOrDefaultAsync(x => x.Name == name);
    }
}