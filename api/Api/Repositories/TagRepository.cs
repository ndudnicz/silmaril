using Api.Entities;
using Api.Repositories.EFContext;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class TagRepository(AppDbContext db): ITagRepository
{
    public async Task<Tag> GetTagAsync(Guid id)
    {
        return await db.Tags.FirstAsync(x => x.Id == id);
    }

    public async Task<List<Tag>> GetTagByIdBulkAsync(Guid[] ids)
    {
        return await db.Tags.Where(x => ids.Contains(x.Id)).ToListAsync();
    }
    
    public async Task<Tag> GetTagByNameAsync(string name)
    {
        return await db.Tags.FirstAsync(x => x.Name == name);
    }
    
    public async Task<List<Tag>> GetTagByNameBulkAsync(string[] names)
    {
        return await db.Tags.Where(x => names.Contains(x.Name)).ToListAsync();
    }
}