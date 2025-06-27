using Api.Entities;
using Api.Exceptions;
using Api.Repositories;

namespace Api.Services;

public class TagService(
    ITagRepository tagRepository
    ): ITagService
{
    public async Task<List<Tag>> GetTagsAsync()
    {
        return await tagRepository.GetTagsAsync();
    }
    public async Task<Tag> GetTagAsync(Guid id)
    {
        var tag = await tagRepository.GetTagAsync(id);
        if (tag == null)
        {
            throw new TagNotFound(id);
        }
        return tag;
    }
    
    public async Task<Tag> GetTagByNameAsync(string name)
    {
        return await tagRepository.GetTagByNameAsync(name);
    }
    
    public async Task<List<Tag>> GetTagByNameBulkAsync(string[] names)
    {
        var tags = await tagRepository.GetTagByNameBulkAsync(names);
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