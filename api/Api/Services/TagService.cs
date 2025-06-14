using Api.Entities;
using Api.Repositories;
using Api.Services.Exceptions;

namespace Api.Services;

public class TagService(
    ITagRepository loginRepository
    ): ITagService
{
    public async Task<Tag> GetTagAsync(int id)
    {
        var tag = await loginRepository.GetTagAsync(id);
        if (tag == null)
        {
            throw new TagNotFound(id);
        }
        return tag;
    }
    
    public async Task<Tag> GetTagByNameAsync(string name)
    {
        var tag = await loginRepository.GetTagByNameAsync(name);
        if (tag == null)
        {
            throw new TagNameNotFound(name);
        }
        return tag;
    }
}