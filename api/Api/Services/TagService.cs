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
    
    public async Task<List<Tag>> GetTagsByNamesAsync(string[] names)
    {
        var tags = await tagRepository.GetTagsByNamesAsync(names);
        if (tags.Count != names.Length)
        {
            var missingNames = names.Except(tags.Select(t => t.Name)).ToArray();
            throw new TagsNotFound("Name", string.Join(", ", missingNames));
        }
        return tags;
    }
}