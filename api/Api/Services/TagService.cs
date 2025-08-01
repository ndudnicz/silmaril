using Api.Entities;
using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

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
        EnsureAllTagNamesExist(names, tags);
        return tags;
    }

    public void EnsureAllTagNamesExist(string[] names, List<Tag> tags)
    {
        if (tags.Count == names.Length) return;
        var missingNames = names.Except(tags.Select(t => t.Name)).ToArray();
        throw new TagsNotFound("Name", string.Join(", ", missingNames));
    }
}