using Api.Entities;

namespace Api.Services;

public interface ITagService
{
    public Task<List<Tag>> GetTagsAsync();
    public Task<List<Tag>> GetTagsByNamesAsync(string[] names);
    public void EnsureAllTagNamesExist(string[] names, List<Tag> tags);
}