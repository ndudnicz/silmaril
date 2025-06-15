using Api.Entities;
using Api.Exceptions;
using Api.Repositories;

namespace Api.Services;

public class TagService(
    ITagRepository loginRepository
    ): ITagService
{
    public async Task<Tag> GetTagAsync(Guid id)
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
        return await loginRepository.GetTagByNameAsync(name);
    }
    
    public async Task<List<Tag>> GetTagByNameBulkAsync(string[] names)
    {
        var tags = await loginRepository.GetTagByNameBulkAsync(names);
        if (tags == null || tags.Count == 0)
        {
            throw new TagNameNotFound(names[0]);
        }
        if (tags.Count != names.Length)
        {
            var missingNames = names.Except(tags.Select(t => t.Name)).ToArray();
            throw new TagNamesNotFound(string.Join(", ", missingNames));
        }
        return tags;
    }
}