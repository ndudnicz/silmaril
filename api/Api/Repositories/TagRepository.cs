using Api.Entities;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class TagRepository(AppDbContext db): ITagRepository
{
    public async Task<List<Tag>> GetTagsAsync()
    {
        return await db.Tags.ToListAsync();
    }
    
    public async Task<List<Tag>> GetTagsByNamesAsync(string[] names)
    {
        return await db.Tags.Where(x => names.Contains(x.Name)).ToListAsync();
    }
}