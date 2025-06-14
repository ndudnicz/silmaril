using Api.Entities;
using Api.Repositories;
using Api.Services.Exceptions;

namespace Api.Services;

public class TagService(
    ITagRepository loginRepository
    ): ITagService
{
    public async Task<Tag?> GetTagAsync(int id)
    {
        return await loginRepository.GetTagAsync(id);
    }
    
    public async Task<Tag?> GetTagByNameAsync(string name)
    {
        var tag = await loginRepository.GetTagByNameAsync(name);
        if (tag == null)
        {
            throw TagServiceException.TagNameNotFound(name);
        }
        return tag;
    }
}